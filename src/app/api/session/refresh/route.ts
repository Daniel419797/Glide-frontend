import { NextRequest, NextResponse } from "next/server";
import { backendFetch, backendUnavailableResponse, UpstreamUnavailableError } from "@/lib/backend";
import {
  clearRefreshToken,
  getRefreshToken,
  hasTrustedOrigin,
  setRefreshToken,
} from "@/lib/session-cookie";

type RefreshEnvelope = { success: true; data: { accessToken: string; refreshToken: string } };

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
  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Session expired" } },
      { status: 401 },
    );
  }

  try {
    const upstream = await backendFetch("/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await upstream.json().catch(() => null)) as RefreshEnvelope | null;
    if (!upstream.ok || !payload?.success) {
      const response = NextResponse.json(
        payload ?? { success: false, error: { code: "UNAUTHORIZED", message: "Session expired" } },
        { status: upstream.status },
      );
      clearRefreshToken(response);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      data: { accessToken: payload.data.accessToken },
    });
    setRefreshToken(response, payload.data.refreshToken);
    return response;
  } catch (error) {
    if (error instanceof UpstreamUnavailableError) return backendUnavailableResponse();
    throw error;
  }
}
