import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignedRequest } from "@/lib/facebook-signed-request";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FACEBOOK_SECRET = process.env.FACEBOOK_SECRET;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const signedRequest = formData.get("signed_request");

  if (typeof signedRequest !== "string" || !signedRequest) {
    return NextResponse.json(
      { error: "Missing signed_request" },
      { status: 400 },
    );
  }

  if (!FACEBOOK_SECRET) {
    console.error("FACEBOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const payload = await verifySignedRequest(signedRequest, FACEBOOK_SECRET);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid signed_request" },
      { status: 400 },
    );
  }

  const facebookUserId = payload.user_id;
  if (typeof facebookUserId !== "string" || !facebookUserId) {
    return NextResponse.json(
      { error: "Missing user_id in payload" },
      { status: 400 },
    );
  }

  const confirmationCode = crypto.randomUUID();

  const account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "facebook",
        providerAccountId: facebookUserId,
      },
    },
    include: { user: true },
  });

  if (!account) {
    await prisma.dataDeletionRequest.create({
      data: {
        confirmationCode,
        userId: null,
        provider: "facebook",
        providerAccountId: facebookUserId,
        status: "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      url: `${APP_URL}/ro/data-deletion?confirmation_code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  }

  const existingRequest = await prisma.dataDeletionRequest.findFirst({
    where: {
      provider: "facebook",
      providerAccountId: facebookUserId,
      status: "completed",
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingRequest) {
    return NextResponse.json({
      url: `${APP_URL}/ro/data-deletion?confirmation_code=${existingRequest.confirmationCode}`,
      confirmation_code: existingRequest.confirmationCode,
    });
  }

  const userId = account.userId;

  await prisma.dataDeletionRequest.create({
    data: {
      confirmationCode,
      userId,
      provider: "facebook",
      providerAccountId: facebookUserId,
      status: "pending",
    },
  });

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    console.error("Error deleting user:", error);
  }

  await prisma.dataDeletionRequest.update({
    where: { confirmationCode },
    data: {
      status: "completed",
      completedAt: new Date(),
      userId: null,
    },
  });

  return NextResponse.json({
    url: `${APP_URL}/ro/data-deletion?confirmation_code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
