import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

describe("admin-auth", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ADMIN_SECRET = "test-admin-secret-12345";
  });

  async function importAdminAuth() {
    return import("./admin-auth");
  }

  it("returns null for correct secret", async () => {
    const { validateAdminAuth } = await importAdminAuth();
    const req = new NextRequest("http://localhost:3000/api/admin/test", {
      headers: { "x-admin-secret": "test-admin-secret-12345" },
    });
    expect(validateAdminAuth(req)).toBeNull();
  });

  it("returns 401 for missing header", async () => {
    const { validateAdminAuth } = await importAdminAuth();
    const req = new NextRequest("http://localhost:3000/api/admin/test");
    const result = validateAdminAuth(req);
    expect(result).toEqual({ error: "Unauthorized", status: 401 });
  });

  it("returns 401 for wrong secret", async () => {
    const { validateAdminAuth } = await importAdminAuth();
    const req = new NextRequest("http://localhost:3000/api/admin/test", {
      headers: { "x-admin-secret": "wrong-secret" },
    });
    const result = validateAdminAuth(req);
    expect(result).toEqual({ error: "Unauthorized", status: 401 });
  });

  it("returns 503 when ADMIN_SECRET is not configured", async () => {
    delete process.env.ADMIN_SECRET;
    const { validateAdminAuth } = await importAdminAuth();
    const req = new NextRequest("http://localhost:3000/api/admin/test", {
      headers: { "x-admin-secret": "anything" },
    });
    const result = validateAdminAuth(req);
    expect(result).toEqual({ error: "Admin not configured", status: 503 });
  });
});
