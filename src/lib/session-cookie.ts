import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/server-env";

export function getRefreshToken(request: NextRequest) {
  return request.cookies.get(serverEnv.GLIDE_SESSION_COOKIE)?.value ?? null;
}

export function setRefreshToken(response: NextResponse, token: string) {
  response.cookies.set(serverEnv.GLIDE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/session",
    maxAge: serverEnv.GLIDE_SESSION_MAX_AGE_SECONDS,
    priority: "high",
  });
}

export function clearRefreshToken(response: NextResponse) {
  response.cookies.set(serverEnv.GLIDE_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/session",
    maxAge: 0,
  });
}

export function hasTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return serverEnv.NODE_ENV !== "production";
  const expected = serverEnv.GLIDE_APP_URL ?? request.nextUrl.origin;
  return origin === expected;
}
