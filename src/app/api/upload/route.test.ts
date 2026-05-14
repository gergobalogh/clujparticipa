import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { _resetBuckets } from "@/lib/rate-limit";
import { mockAnonymousAuth } from "@/test/helpers/auth-mocks";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const authMocks = mockAnonymousAuth();
vi.mock("@/lib/auth-participant", () => ({
  getAuthSession: authMocks.getAuthSession,
  resolveParticipantHash: authMocks.resolveParticipantHash,
}));

// Mock Cloudflare Images API
const mockCfResponse = {
  success: true,
  result: {
    id: "cf-test-image-id",
    filename: "test.jpg",
    uploaded: "2026-05-14T10:00:00Z",
    variants: ["https://imagedelivery.net/test-account/cf-test-image-id/public"],
    requireSignedURLs: false,
  },
};

const originalFetch = global.fetch;
vi.stubGlobal("fetch", vi.fn(async (url: string, options?: RequestInit) => {
  if (typeof url === "string" && url.includes("cloudflare.com")) {
    return new Response(JSON.stringify(mockCfResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return originalFetch(url, options);
}));

const TOKEN = "anonymous-test-token-upload-1234";

// Helper: create a valid JPEG buffer (1x1 pixel)
function makeJpegBuffer(): Buffer {
  const buf = Buffer.from(
    "ffd8ffe000104a46494600010100000100010000" +
    "ffc0000b0800010001012200" +
    "ffc4001f0000010501010101010100000000000000000102030405060708090a0b" +
    "ffda000c03010002110311003f00" +
    "7b9e4c1482a081a" +
    "ffd9",
    "hex"
  );
  return buf;
}

// Helper: create a valid PNG buffer (1x1 red pixel)
function makePngBuffer(): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0);
  ihdrData.writeUInt32BE(1, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const crc32 = makeCrc32();
  const ihdrCrc = crc32(Buffer.concat([Buffer.from("IHDR"), ihdrData]));
  const ihdr = Buffer.alloc(4 + 4 + 13 + 4);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write("IHDR", 4);
  ihdrData.copy(ihdr, 8);
  ihdr.writeInt32BE(ihdrCrc, 21);

  const zlib = require("zlib");
  const rawData = Buffer.from([0, 255, 0, 0]);
  const compressed = zlib.deflateSync(rawData);
  const idatCrc = crc32(Buffer.concat([Buffer.from("IDAT"), compressed]));
  const idat = Buffer.alloc(4 + 4 + compressed.length + 4);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write("IDAT", 4);
  compressed.copy(idat, 8);
  idat.writeInt32BE(idatCrc, 8 + compressed.length);

  const iendCrc = crc32(Buffer.from("IEND"));
  const iend = Buffer.alloc(4 + 4 + 0 + 4);
  iend.writeUInt32BE(0, 0);
  iend.write("IEND", 4);
  iend.writeInt32BE(iendCrc, 8);

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Helper: create a valid lossy WebP buffer (1x1 pixel)
function makeWebPBuffer(): Buffer {
  const riff = Buffer.from("RIFF");
  const webp = Buffer.from("WEBP");
  const vp8 = Buffer.from("VP8 ");
  const vp8Payload = Buffer.from(
    "9d0148300100010001002d012e00ff0090" +
    "9d01483001" + "0001" + "0001" + "002d012e00",
    "hex"
  );
  const chunkSize = 4 + vp8Payload.length;
  const fileSize = 4 + 4 + 4 + chunkSize;
  const buf = Buffer.alloc(fileSize + 8);
  riff.copy(buf, 0);
  buf.writeUInt32LE(fileSize, 4);
  webp.copy(buf, 8);
  vp8.copy(buf, 12);
  buf.writeUInt32LE(chunkSize, 16);
  vp8Payload.copy(buf, 20);
  return buf;
}

function makeCrc32() {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return (buf: Buffer) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return crc ^ 0xffffffff;
  };
}

// Helper: build a multipart/form-data request
function bufferToReadableStream(buf: Buffer): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buf));
      controller.close();
    },
  });
}

function makeUploadRequest(
  files: Array<{ name: string; type: string; buffer: Buffer }>,
  token: string
): NextRequest {
  const boundary = "----TestBoundary" + Date.now();
  const parts: Buffer[] = [];

  for (const f of files) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="${f.name}"\r\nContent-Type: ${f.type}\r\n\r\n`
    ));
    parts.push(f.buffer);
    parts.push(Buffer.from("\r\n"));
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  return new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "x-participant-token": token,
    },
    body: bufferToReadableStream(body),
    duplex: "half",
  });
}

describe("POST /api/upload", () => {
  beforeEach(async () => {
    await truncateAll(testPrisma);
    vi.mocked(fetch).mockClear();
  });

  afterEach(async () => {
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
    vi.restoreAllMocks();
  });

  it("accepts a valid JPEG upload and returns Cloudflare URL", async () => {
    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.images).toHaveLength(1);
    expect(body.images[0].mimeType).toBe("image/jpeg");
    expect(body.images[0].url).toMatch(/^https:\/\/imagedelivery\.net\//);
  });

  it("accepts a valid PNG upload and returns dimensions", async () => {
    const req = makeUploadRequest(
      [{ name: "test.png", type: "image/png", buffer: makePngBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.images).toHaveLength(1);
    expect(body.images[0].mimeType).toBe("image/png");
    expect(body.images[0].width).toBe(1);
    expect(body.images[0].height).toBe(1);
    expect(body.images[0].url).toMatch(/^https:\/\/imagedelivery\.net\//);
  });

  it("accepts a valid WebP upload", async () => {
    const req = makeUploadRequest(
      [{ name: "test.webp", type: "image/webp", buffer: makeWebPBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.images).toHaveLength(1);
    expect(body.images[0].mimeType).toBe("image/webp");
    expect(body.images[0].url).toMatch(/^https:\/\/imagedelivery\.net\//);
  });

  it("accepts multiple images in one request", async () => {
    const req = makeUploadRequest(
      [
        { name: "a.jpg", type: "image/jpeg", buffer: makeJpegBuffer() },
        { name: "b.png", type: "image/png", buffer: makePngBuffer() },
      ],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.images).toHaveLength(2);
    expect(body.images[0].order).toBe(0);
    expect(body.images[1].order).toBe(1);
  });

  it("rejects upload exceeding max count (5)", async () => {
    const files = Array.from({ length: 6 }, (_, i) => ({
      name: `img${i}.jpg`,
      type: "image/jpeg",
      buffer: makeJpegBuffer(),
    }));
    const req = makeUploadRequest(files, TOKEN);
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects spoofed MIME type (magic byte mismatch)", async () => {
    const req = makeUploadRequest(
      [{ name: "fake.jpg", type: "image/jpeg", buffer: makePngBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/does not match/);
  });

  it("rejects disallowed MIME type", async () => {
    const gifBuf = Buffer.from("GIF89a" + "\0".repeat(10));
    const req = makeUploadRequest(
      [{ name: "test.gif", type: "image/gif", buffer: gifBuf }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("requires participant identification (401)", async () => {
    const boundary = "----TestBoundary";
    const body = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\ntest\r\n--${boundary}--\r\n`
    );
    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: bufferToReadableStream(body),
      duplex: "half",
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 503 when Cloudflare env vars are missing", async () => {
    const origAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const origApiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_IMAGES_API_TOKEN;

    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/);

    process.env.CLOUDFLARE_ACCOUNT_ID = origAccountId;
    process.env.CLOUDFLARE_IMAGES_API_TOKEN = origApiToken;
  });

  it("returns 503 when only CLOUDFLARE_ACCOUNT_ID is missing", async () => {
    const origAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;

    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(503);

    process.env.CLOUDFLARE_ACCOUNT_ID = origAccountId;
  });

  it("returns 503 when only CLOUDFLARE_IMAGES_API_TOKEN is missing", async () => {
    const origApiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
    delete process.env.CLOUDFLARE_IMAGES_API_TOKEN;

    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(503);

    process.env.CLOUDFLARE_IMAGES_API_TOKEN = origApiToken;
  });

  it("returns 502 when Cloudflare API rejects the upload", async () => {
    vi.mocked(fetch).mockImplementationOnce(async (url: string | Request | URL) => {
      if (typeof url === "string" && url.includes("cloudflare.com")) {
        return new Response(
          JSON.stringify({ success: false, errors: [{ message: "Upload failed" }] }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      return originalFetch(url as string, undefined as unknown as RequestInit);
    });

    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/upload failed/i);
    expect(body.detail).toBeDefined();
  });

  it("returns 502 when Cloudflare API returns non-JSON response", async () => {
    vi.mocked(fetch).mockImplementationOnce(async (url: string | Request | URL) => {
      if (typeof url === "string" && url.includes("cloudflare.com")) {
        return new Response("Internal Server Error", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
      return originalFetch(url as string, undefined as unknown as RequestInit);
    });

    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it("calls Cloudflare API with correct URL and auth header", async () => {
    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);

    const cfCalls = vi.mocked(fetch).mock.calls.filter(
      (call: unknown[]) => typeof call[0] === "string" && (call[0] as string).includes("cloudflare.com")
    );
    expect(cfCalls.length).toBe(1);
    const [cfUrl, cfOptions] = cfCalls[0];
    expect(cfUrl).toContain("/accounts/test-account-id/images/v1");
    expect((cfOptions as RequestInit).headers).toHaveProperty("Authorization", "Bearer test-api-token");
  });

  it("returns the Cloudflare variant URL from the response", async () => {
    const customResponse = {
      success: true,
      result: {
        id: "custom-image-id",
        filename: "test.jpg",
        uploaded: "2026-05-14T12:00:00Z",
        variants: [
          "https://imagedelivery.net/test-account/custom-image-id/variant1",
          "https://imagedelivery.net/test-account/custom-image-id/variant2",
        ],
        requireSignedURLs: false,
      },
    };
    vi.mocked(fetch).mockImplementationOnce(async (url: string | Request | URL) => {
      if (typeof url === "string" && url.includes("cloudflare.com")) {
        return new Response(JSON.stringify(customResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return originalFetch(url as string, undefined as unknown as RequestInit);
    });

    const req = makeUploadRequest(
      [{ name: "test.jpg", type: "image/jpeg", buffer: makeJpegBuffer() }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    // Should use variants[0]
    expect(body.images[0].url).toBe("https://imagedelivery.net/test-account/custom-image-id/variant1");
  });

  it("rejects file exceeding size limit", async () => {
    const oversizedBuf = Buffer.alloc(6 * 1024 * 1024, 0xff); // 6 MB > 5 MB limit
    // Make it look like a JPEG
    oversizedBuf[0] = 0xff;
    oversizedBuf[1] = 0xd8;
    const req = makeUploadRequest(
      [{ name: "big.jpg", type: "image/jpeg", buffer: oversizedBuf }],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/exceeds/);
  });

  it("returns correct order values for multiple images", async () => {
    const req = makeUploadRequest(
      [
        { name: "first.jpg", type: "image/jpeg", buffer: makeJpegBuffer() },
        { name: "second.png", type: "image/png", buffer: makePngBuffer() },
        { name: "third.webp", type: "image/webp", buffer: makeWebPBuffer() },
      ],
      TOKEN
    );
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.images).toHaveLength(3);
    expect(body.images[0].order).toBe(0);
    expect(body.images[1].order).toBe(1);
    expect(body.images[2].order).toBe(2);
  });
});
