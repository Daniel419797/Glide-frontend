import { NextRequest, NextResponse } from "next/server";
import { backendFetch, backendUnavailableResponse, UpstreamUnavailableError } from "@/lib/backend";
import { hasTrustedOrigin, setRefreshToken } from "@/lib/session-cookie";

type LoginEnvelope = {
  success: true;
  data: { accessToken: string; refreshToken: string; profile: unknown };
};

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

  try {
    const upstream = await backendFetch("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: await request.text(),
    });
    const payload = (await upstream.json().catch(() => null)) as LoginEnvelope | null;
    if (!upstream.ok || !payload?.success) {
      return NextResponse.json(
        payload ?? {
          success: false,
          error: { code: "LOGIN_FAILED", message: "Unable to sign in" },
        },
        { status: upstream.status },
      );
    }

    const response = NextResponse.json({
      success: true,
      data: { accessToken: payload.data.accessToken, profile: payload.data.profile },
    });
    setRefreshToken(response, payload.data.refreshToken);
    return response;
  } catch (error) {
    if (error instanceof UpstreamUnavailableError) return backendUnavailableResponse();
    throw error;
  }
}
