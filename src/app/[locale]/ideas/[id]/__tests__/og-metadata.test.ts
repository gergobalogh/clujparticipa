import { describe, it, expect, vi } from "vitest";

// This test verifies the generateMetadata function for the idea detail page.
// The page must be restructured as a server component to export generateMetadata.

// @ts-ignore — testing the metadata export from the server component page
import { generateMetadata } from "@/app/[locale]/ro/ideas/[id]/page";

// Note: The actual import path depends on how Next.js resolves the [locale] segment
// for testing. This may need adjustment once the page is restructured.

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    idea: {
      findUnique: () => mockFindUnique(),
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) =>
    Promise.resolve((key: string) => `${ns}.${key}`),
}));

describe("Idea Detail Page — generateMetadata (OG tags)", () => {
  it("emits og:title with the idea title", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-1",
      title: "New bike lane on Dorobantilor",
      description: "A dedicated bike lane along Dorobantilor street",
      category: "TRANSPORT",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [{ url: "https://example.com/photo.jpg" }],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-1", locale: "ro" }),
    });

    expect(metadata.openGraph?.title).toBe("New bike lane on Dorobantilor");
  });

  it("emits og:description truncated to 160 chars with category and district", async () => {
    const longDesc = "A".repeat(200);
    mockFindUnique.mockResolvedValue({
      id: "idea-2",
      title: "Park benches",
      description: longDesc,
      category: "INFRASTRUCTURE",
      district: "GHEORGHENI",
      status: "SUBMITTED",
      images: [{ url: "https://example.com/photo.jpg" }],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-2", locale: "ro" }),
    });

    const desc = metadata.openGraph?.description as string;
    expect(desc.length).toBeLessThanOrEqual(200); // 160 + " — INFRASTRUCTURE, GHEORGHENI"
    expect(desc).toContain("INFRASTRUCTURE");
    expect(desc).toContain("GHEORGHENI");
  });

  it("emits og:image with absolute URL for ideas with uploaded images", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-3",
      title: "Test idea",
      description: "Short desc",
      category: "TRANSPORT",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [{ url: "https://example.com/photo.jpg" }],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-3", locale: "ro" }),
    });

    const ogImage = metadata.openGraph?.images as { url: string };
    expect(ogImage?.url).toMatch(/^https?:\/\//);
  });

  it("uses OG placeholder image URL for ideas without uploaded images", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-4",
      title: "No photo idea",
      description: "Short desc",
      category: "EDUCATION",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-4", locale: "ro" }),
    });

    const ogImage = metadata.openGraph?.images as { url: string };
    expect(ogImage?.url).toContain("/api/og/ideas/idea-4");
  });

  it("emits og:url with locale prefix", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-5",
      title: "Locale test",
      description: "Desc",
      category: "TRANSPORT",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-5", locale: "hu" }),
    });

    expect(metadata.openGraph?.url).toContain("/hu/ideas/idea-5");
  });

  it("handles null idea gracefully — returns not-found metadata", async () => {
    mockFindUnique.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "nonexistent", locale: "ro" }),
    });

    // Should return minimal metadata, not throw
    expect(metadata).toBeDefined();
    expect(metadata.title).toBeDefined();
  });

  it("uses fallback description for ideas with no description text", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-6",
      title: "Empty description idea",
      description: "",
      category: "SAFETY",
      district: "GHEORGHENI",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-6", locale: "ro" }),
    });

    const desc = metadata.openGraph?.description as string;
    // Should contain category and district as fallback
    expect(desc).toContain("SAFETY");
    expect(desc).toContain("GHEORGHENI");
  });
});
