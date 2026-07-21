import "server-only";

import { serverEnv } from "@/lib/server-env";

export class UpstreamUnavailableError extends Error {
  constructor() {
    super("Backend unavailable");
    this.name = "UpstreamUnavailableError";
  }
}

export function backendUrl(path: string) {
  const base = serverEnv.GLIDE_API_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  try {
    return await fetch(backendUrl(path), {
      ...init,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(serverEnv.GLIDE_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new UpstreamUnavailableError();
  }
}

export function backendUnavailableResponse() {
  return Response.json(
    {
      success: false,
      error: {
        code: "BACKEND_UNAVAILABLE",
        message: "Glide cannot reach the backend service right now. Try again shortly.",
      },
    },
    { status: 503 },
  );
}
