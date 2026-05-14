import { NextRequest, NextResponse } from "next/server";
import { validateParticipantToken } from "@/lib/participant";
import { getAuthSession, resolveParticipantHash } from "@/lib/auth-participant";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  IMAGE_MAX_COUNT,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_ALLOWED_MIME_TYPES,
  isAllowedMimeType,
} from "@/lib/image-validation";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_IMAGES_API_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads are not configured (missing Cloudflare credentials)" },
      { status: 503 }
    );
  }

  const session = await getAuthSession();
  const participantToken = request.headers.get("x-participant-token");

  const participantHash = await resolveParticipantHash(
    session,
    participantToken ?? null,
  );

  if (!participantHash) {
    return NextResponse.json(
      { error: "Participant identification required" },
      { status: 401 }
    );
  }

  // Validate anonymous token if no session
  if (!session && participantToken) {
    const tokenError = validateParticipantToken(participantToken);
    if (tokenError) {
      return NextResponse.json({ error: tokenError }, { status: 401 });
    }
  }

  const rateLimit = checkRateLimit(`upload:create:${participantHash}`, RATE_LIMITS.create);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const formData = await request.formData();
  const files = formData.getAll("images") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }
  if (files.length > IMAGE_MAX_COUNT) {
    return NextResponse.json(
      { error: `Too many images. Maximum is ${IMAGE_MAX_COUNT}` },
      { status: 400 }
    );
  }

  const results: Array<{
    url: string;
    width: number | null;
    height: number | null;
    mimeType: string;
    sizeBytes: number;
    order: number;
  }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: `File ${i + 1}: type "${file.type}" is not allowed. Allowed: ${IMAGE_ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File ${i + 1}: size exceeds ${IMAGE_MAX_SIZE_BYTES / (1024 * 1024)} MB limit` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic-byte validation: verify file content matches declared MIME type
    const magicError = validateMagicBytes(buffer, file.type);
    if (magicError) {
      return NextResponse.json(
        { error: `File ${i + 1}: ${magicError}` },
        { status: 400 }
      );
    }

    const dimensions = await getImageDimensions(buffer);

    // Upload to Cloudflare Images
    const cfForm = new FormData();
    cfForm.append(
      "file",
      new Blob([buffer], { type: file.type }),
      `${randomUUID()}${mimeToExt(file.type)}`
    );

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_API_TOKEN}` },
        body: cfForm,
      }
    );

    if (!cfRes.ok) {
      const err = await cfRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Image upload failed", detail: err },
        { status: 502 }
      );
    }

    const cfData = await cfRes.json();
    const url: string = cfData.result.variants[0];

    results.push({
      url,
      width: dimensions.width,
      height: dimensions.height,
      mimeType: file.type,
      sizeBytes: file.size,
      order: i,
    });
  }

  return NextResponse.json({ images: results }, { status: 201 });
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/png": return ".png";
    case "image/webp": return ".webp";
    default: return ".jpg";
  }
}

async function getImageDimensions(buffer: Buffer): Promise<{ width: number | null; height: number | null }> {
  // Minimal PNG header parse
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  // Minimal JPEG header parse — find SOF0 marker
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xff) { offset++; continue; }
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const segLen = buffer.readUInt16BE(offset + 2);
      offset += 2 + segLen;
    }
  }
  // WebP: "RIFF....WEBP"
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunkType = buffer.toString("ascii", 12, 16);
    // VP8 — lossy
    if (chunkType === "VP8 ") {
      const width = (buffer.readUInt16LE(26) & 0x3fff);
      const height = (buffer.readUInt16LE(28) & 0x3fff);
      return { width, height };
    }
    // VP8L — lossless
    if (chunkType === "VP8L") {
      const word = buffer.readUInt32LE(21);
      const width = (word & 0x3fff) + 1;
      const height = ((word >> 14) & 0x3fff) + 1;
      return { width, height };
    }
    // VP8X — extended (alpha, animation, etc.)
    if (chunkType === "VP8X") {
      const canvasWidth = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1;
      const canvasHeight = (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1;
      return { width: canvasWidth, height: canvasHeight };
    }
  }
  return { width: null, height: null };
}

function validateMagicBytes(buffer: Buffer, mimeType: string): string | null {
  if (mimeType === "image/jpeg") {
    if (!(buffer[0] === 0xff && buffer[1] === 0xd8)) {
      return "File content does not match declared type (image/jpeg).";
    }
  } else if (mimeType === "image/png") {
    if (!(buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)) {
      return "File content does not match declared type (image/png).";
    }
  } else if (mimeType === "image/webp") {
    if (!(buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")) {
      return "File content does not match declared type (image/webp).";
    }
  }
  return null;
}
