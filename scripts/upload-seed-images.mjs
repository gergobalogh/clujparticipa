import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEED_DIR = path.join(ROOT, "public", "seed");
const MANIFEST_PATH = path.join(SEED_DIR, "manifest.json");
const MAX_IMAGES_PER_IDEA = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_BY_EXT = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_IMAGES_API_TOKEN.");
  }

  await fs.mkdir(SEED_DIR, { recursive: true });

  const existingManifest = await readExistingManifest();
  const folders = await listIdeaFolders();
  const manifest = {};

  for (const folder of folders) {
    const folderPath = path.join(SEED_DIR, folder);
    const imageFiles = await listImageFiles(folderPath);

    if (imageFiles.length === 0) continue;
    if (imageFiles.length > MAX_IMAGES_PER_IDEA) {
      throw new Error(`${folder} has ${imageFiles.length} images. Maximum is ${MAX_IMAGES_PER_IDEA}.`);
    }

    manifest[folder] = [];

    for (const [order, fileName] of imageFiles.entries()) {
      const filePath = path.join(folderPath, fileName);
      const fileKey = `${folder}/${fileName}`;
      const stat = await fs.stat(filePath);
      const mimeType = mimeForFile(fileName);

      if (!mimeType) {
        throw new Error(`${fileKey} is not a supported image type.`);
      }
      if (stat.size > MAX_SIZE_BYTES) {
        throw new Error(`${fileKey} exceeds ${MAX_SIZE_BYTES / (1024 * 1024)} MB.`);
      }

      const existing = existingManifest[folder]?.find(
        (image) => image.sourceFile === fileName && image.sizeBytes === stat.size
      );

      if (existing?.url) {
        manifest[folder].push({ ...existing, order });
        console.log(`reuse ${fileKey}`);
        continue;
      }

      const buffer = await fs.readFile(filePath);
      const magicError = validateMagicBytes(buffer, mimeType);
      if (magicError) {
        throw new Error(`${fileKey}: ${magicError}`);
      }

      const dimensions = getImageDimensions(buffer);
      const url = await uploadToCloudflare({ accountId, apiToken, buffer, mimeType });

      manifest[folder].push({
        url,
        alt: null,
        width: dimensions.width,
        height: dimensions.height,
        mimeType,
        sizeBytes: stat.size,
        order,
        sourceFile: fileName,
      });

      console.log(`upload ${fileKey}`);
    }
  }

  await fs.writeFile(`${MANIFEST_PATH}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.rename(`${MANIFEST_PATH}.tmp`, MANIFEST_PATH);
  console.log(`wrote ${path.relative(ROOT, MANIFEST_PATH)}`);
}

async function readExistingManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function listIdeaFolders() {
  const entries = await fs.readdir(SEED_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function listImageFiles(folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && MIME_BY_EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function mimeForFile(fileName) {
  return MIME_BY_EXT.get(path.extname(fileName).toLowerCase()) ?? null;
}

async function uploadToCloudflare({ accountId, apiToken, buffer, mimeType }) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), `${randomUUID()}${extForMime(mimeType)}`);

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiToken}` },
    body: form,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Cloudflare upload failed: ${JSON.stringify(body)}`);
  }

  const url = body?.result?.variants?.[0];
  if (!url) {
    throw new Error(`Cloudflare upload returned no variant URL: ${JSON.stringify(body)}`);
  }

  return url;
}

function extForMime(mimeType) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}

function getImageDimensions(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      const segLen = buffer.readUInt16BE(offset + 2);
      offset += 2 + segLen;
    }
  }

  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunkType = buffer.toString("ascii", 12, 16);
    if (chunkType === "VP8 ") {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (chunkType === "VP8L") {
      const word = buffer.readUInt32LE(21);
      return { width: (word & 0x3fff) + 1, height: ((word >> 14) & 0x3fff) + 1 };
    }
    if (chunkType === "VP8X") {
      return {
        width: (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1,
        height: (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1,
      };
    }
  }

  return { width: null, height: null };
}

function validateMagicBytes(buffer, mimeType) {
  if (mimeType === "image/jpeg" && !(buffer[0] === 0xff && buffer[1] === 0xd8)) {
    return "File content does not match declared type image/jpeg.";
  }

  if (
    mimeType === "image/png" &&
    !(buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
  ) {
    return "File content does not match declared type image/png.";
  }

  if (
    mimeType === "image/webp" &&
    !(buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")
  ) {
    return "File content does not match declared type image/webp.";
  }

  return null;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
