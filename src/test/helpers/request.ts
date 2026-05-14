import { NextRequest } from "next/server";

const BASE_URL = "http://localhost:3000";

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

export function makeRequest(path: string, init?: NextRequestInit): NextRequest {
  return new NextRequest(new URL(path, BASE_URL), init);
}

export function makeAdminRequest(
  path: string,
  init?: NextRequestInit
): NextRequest {
  const headers = new Headers(init?.headers as HeadersInit);
  headers.set("x-admin-secret", process.env.ADMIN_SECRET!);
  return makeRequest(path, { ...init, headers });
}

export function makeParticipantRequest(
  path: string,
  token: string,
  init?: NextRequestInit
): NextRequest {
  const headers = new Headers(init?.headers as HeadersInit);
  headers.set("x-participant-token", token);
  return makeRequest(path, { ...init, headers });
}
