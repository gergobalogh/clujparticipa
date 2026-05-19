import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the generateMetadata function for the idea detail page.
// The page is restructured as a server component that exports generateMetadata.

// We must mock all client-side dependencies before importing the page module.
// The client island (IdeaDetailClient) and next-intl/server need mocking
// to avoid ESM resolution issues in the vitest node environment.

const mockFindUnique = vi.fn();

const categoryTranslations: Record<string, string> = {
  INFRASTRUCTURE: "Infrastructure",
  EDUCATION: "Education",
  ENVIRONMENT: "Environment",
  CULTURE: "Culture",
  SAFETY: "Safety",
  TRANSPORT: "Transport",
  HEALTH: "Health",
  OTHER: "Other",
};

const districtTranslations: Record<string, string> = {
  MANASTUR: "Manastur",
  GHEORGHENI: "Gheorgheni",
  ZORILOR: "Zorilor",
  CENTRU: "Centru",
  MARASTI: "Marasti",
  GRIGORESCU: "Grigorescu",
  IRIS: "Iris",
  GRUIA: "Gruia",
  ANDREI_MURESANU: "Andrei Muresanu",
  BUNA_ZIUA: "Buna Ziua",
  BORHANCI: "Borhanci",
  DAMBU_ROTUND: "Dambu Rotund",
  OTHER: "Other",
};

const namespaceTranslations: Record<string, Record<string, string>> = {
  Categories: categoryTranslations,
  Districts: districtTranslations,
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    idea: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) =>
    Promise.resolve((key: string) => {
      const nsMap = namespaceTranslations[ns];
      return nsMap?.[key] ?? `${ns}.${key}`;
    }),
}));

vi.mock("@/components/ideas/idea-detail-client", () => ({
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  notFound: () => {},
}));

let generateMetadata: (props: {
  params: Promise<{ id: string; locale: string }>;
}) => Promise<import("next").Metadata>;

describe("Idea Detail Page -- generateMetadata (OG tags)", () => {
  beforeEach(async () => {
    vi.resetModules();
    // Re-establish mocks after reset
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        idea: {
          findUnique: (...args: unknown[]) => mockFindUnique(...args),
        },
      },
    }));
    vi.doMock("next-intl/server", () => ({
      getTranslations: (ns: string) =>
        Promise.resolve((key: string) => {
          const nsMap = namespaceTranslations[ns];
          return nsMap?.[key] ?? `${ns}.${key}`;
        }),
    }));
    vi.doMock("@/components/ideas/idea-detail-client", () => ({
      default: () => null,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: () => {},
    }));

    const mod = await import("@/app/[locale]/ideas/[id]/page");
    generateMetadata = mod.generateMetadata;
  });

  it("S14: emits og:title equal to idea.title", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-1",
      title: "New bike lane on Dorobantilor",
      description: "A dedicated bike lane along Dorobantilor street",
      category: "TRANSPORT",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-1", locale: "ro" }),
    });

    expect(metadata.openGraph?.title).toBe("New bike lane on Dorobantilor");
  });

  it("S15: truncates og:description to 160 chars with ellipsis, followed by category and district", async () => {
    const longDesc = "A".repeat(200);
    mockFindUnique.mockResolvedValue({
      id: "idea-2",
      title: "Park benches",
      description: longDesc,
      category: "INFRASTRUCTURE",
      district: "GHEORGHENI",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-2", locale: "ro" }),
    });

    const desc = metadata.openGraph?.description as string;
    // The description portion (before " -- {category}, {district}") is 160 chars of
    // original content + "..." ellipsis = 163 chars
    const suffix = " -- Infrastructure, Gheorgheni";
    const descWithoutSuffix = desc.slice(0, desc.length - suffix.length);
    expect(descWithoutSuffix.length).toBe(163); // 160 chars + "..."
    expect(descWithoutSuffix).toMatch(/\.\.\.$/); // ends with ellipsis
    expect(desc).toContain("Infrastructure");
    expect(desc).toContain("Gheorgheni");
  });

  it("S15: does not truncate og:description when under 160 chars", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-short",
      title: "Short idea",
      description: "A short description",
      category: "EDUCATION",
      district: "CENTRU",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-short", locale: "ro" }),
    });

    const desc = metadata.openGraph?.description as string;
    expect(desc).toContain("A short description");
    expect(desc).toContain("Education");
    expect(desc).toContain("Centru");
    // No ellipsis for short descriptions
    const suffix = " -- Education, Centru";
    const descWithoutSuffix = desc.slice(0, desc.length - suffix.length);
    expect(descWithoutSuffix).not.toMatch(/\.\.\.$/);
  });

  it("S18: emits og:url with locale segment and idea id", async () => {
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

  it("emits og:type=website and og:site_name=ClujParticipa", async () => {
    mockFindUnique.mockResolvedValue({
      id: "idea-type",
      title: "Type test",
      description: "Desc",
      category: "TRANSPORT",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-type", locale: "ro" }),
    });

    expect(metadata.openGraph?.type).toBe("website");
    expect(metadata.openGraph?.siteName).toBe("ClujParticipa");
  });

  it("S25: handles null idea gracefully without throwing", async () => {
    mockFindUnique.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "nonexistent", locale: "ro" }),
    });

    // Should return minimal metadata, not throw
    expect(metadata).toBeDefined();
    expect(metadata.openGraph?.type).toBe("website");
    expect(metadata.openGraph?.siteName).toBe("ClujParticipa");
  });

  it("S26: uses fallback description when idea description is empty", async () => {
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
    // Fallback should include the title
    expect(desc).toContain("Empty description idea");
    expect(desc).toContain("Safety");
    expect(desc).toContain("Gheorgheni");
  });

  it("S16: emits og:image with absolute URL when idea has uploaded images", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://test.clujparticipa.ro";
    mockFindUnique.mockResolvedValue({
      id: "idea-img",
      title: "Idea with image",
      description: "Has an image",
      category: "ENVIRONMENT",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [
        { id: "img-1", url: "/uploads/park-bench.jpg", order: 0 },
        { id: "img-2", url: "/uploads/park-overview.jpg", order: 1 },
      ],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-img", locale: "ro" }),
    });

    // og:image should be the first image as an absolute URL
    expect(metadata.openGraph?.images).toBeDefined();
    const ogImages = metadata.openGraph?.images;
    // Next.js Metadata accepts string or array; we expect the first image URL
    const firstImageUrl = Array.isArray(ogImages)
      ? (ogImages[0] as { url: string }).url ?? ogImages[0]
      : ogImages;
    expect(firstImageUrl).toBe("https://test.clujparticipa.ro/uploads/park-bench.jpg");

    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("S16: omits og:image when idea has no images", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://test.clujparticipa.ro";
    mockFindUnique.mockResolvedValue({
      id: "idea-noimg",
      title: "Idea without image",
      description: "No images here",
      category: "EDUCATION",
      district: "CENTRU",
      status: "SUBMITTED",
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "idea-noimg", locale: "ro" }),
    });

    // og:image should be omitted -- not present, not undefined with a broken URL
    expect(metadata.openGraph?.images).toBeUndefined();

    delete process.env.NEXT_PUBLIC_APP_URL;
  });
});
