import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
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

  if (!idea) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a2e",
          color: "#ffffff",
          fontSize: 48,
          padding: "60px",
        }}
      >
        {idea.title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
