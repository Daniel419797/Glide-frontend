import { NextRequest, NextResponse } from "next/server";
import { backendFetch, backendUnavailableResponse, UpstreamUnavailableError } from "@/lib/backend";
import { hasTrustedOrigin } from "@/lib/session-cookie";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "idempotency-key",
  "if-none-match",
  "x-request-id",
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-type",
  "etag",
  "location",
  "x-request-id",
] as const;

function isMutation(method: string) {
  return !["GET", "HEAD", "OPTIONS"].includes(method);
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (isMutation(request.method) && !hasTrustedOrigin(request)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed" },
      },
      { status: 403 },
    );
  }

  const { path } = await context.params;
  const upstreamPath = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });

  try {
    const upstream = await backendFetch(upstreamPath, {
      method: request.method,
      headers,
      body: isMutation(request.method) ? await request.arrayBuffer() : undefined,
    });
    const responseHeaders = new Headers();
    FORWARDED_RESPONSE_HEADERS.forEach((name) => {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    });
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    if (error instanceof UpstreamUnavailableError) return backendUnavailableResponse();
    throw error;
  }
}

export const dynamic = "force-dynamic";
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
