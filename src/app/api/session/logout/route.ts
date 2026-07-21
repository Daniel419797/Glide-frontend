import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { clearRefreshToken, getRefreshToken, hasTrustedOrigin } from "@/lib/session-cookie";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed" },
      },
      { status: 403 },
    );
  }
  const refreshToken = getRefreshToken(request);
  const authorization = request.headers.get("authorization");

  if (refreshToken && authorization) {
    await backendFetch("/auth/logout", {
      method: "POST",
      headers: { authorization, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true, data: { message: "Signed out" } });
  clearRefreshToken(response);
  return response;
}
