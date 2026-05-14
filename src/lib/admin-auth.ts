import { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

/**
 * Validate admin authentication from the x-admin-secret header.
 * Returns an error response if invalid, or null if authenticated.
 */
export function validateAdminAuth(
  request: NextRequest
): { error: string; status: number } | null {
  if (!ADMIN_SECRET) {
    return { error: "Admin not configured", status: 503 };
  }

  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== ADMIN_SECRET) {
    return { error: "Unauthorized", status: 401 };
  }

  return null;
}
