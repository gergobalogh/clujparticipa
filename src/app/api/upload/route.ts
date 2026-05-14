import { NextRequest, NextResponse } from "next/server";
import { validateParticipantToken } from "@/lib/participant";
import { getAuthSession, resolveParticipantHash } from "@/lib/auth-participant";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  IMAGE_MAX_COUNT,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_DIR,
  isAllowedMimeType,
} from "@/lib/image-validation";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
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

  const uploadDir = path.join(process.cwd(), "public", IMAGE_UPLOAD_DIR);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
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

    const ext = mimeToExt(file.type);
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const dimensions = await getImageDimensions(buffer);

    results.push({
      url: `/${IMAGE_UPLOAD_DIR}/${filename}`,
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
  // WebP: "RIFF....WEBP" then lossy has "VP8 " at byte 12
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunkType = buffer.toString("ascii", 12, 16);
    if (chunkType === "VP8 ") {
      const width = (buffer.readUInt16LE(26) & 0x3fff);
      const height = (buffer.readUInt16LE(28) & 0x3fff);
      return { width, height };
    }
  }
  return { width: null, height: null };
}
