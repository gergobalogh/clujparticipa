import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { resolveCategoryOgColor } from "@/lib/category-colors";
import { truncateOgTitle } from "@/lib/og-image-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  const url = new URL(request.url);
  const locale = url.searchParams.get("lang") ?? "ro";

  let idea;
  try {
    idea = await prisma.idea.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        district: true,
        status: true,
      },
    });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!idea) {
    return new Response("Not found", { status: 404 });
  }

  const backgroundColor = resolveCategoryOgColor(idea.category);
  const displayTitle = truncateOgTitle(idea.title);

  const t = await getTranslations({ namespace: "Categories", locale });
  const categoryLabel = t(idea.category as Parameters<typeof t>[0]);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          color: "#ffffff",
          fontSize: 48,
          fontWeight: 700,
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            lineHeight: 1.3,
            maxWidth: 1080,
            maxLines: 2,
          }}
        >
          {displayTitle}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            marginTop: 24,
            opacity: 0.8,
          }}
        >
          {categoryLabel}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
