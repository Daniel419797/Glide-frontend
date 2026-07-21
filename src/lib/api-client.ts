import type { ApiEnvelope, ApiErrorEnvelope, Pagination } from "@/types/api";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorEnvelope["error"]["details"],
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

type ApiRequestOptions = RequestInit & {
  idempotencyKey?: string;
  skipAuthRefresh?: boolean;
};

const CLIENT_REQUEST_TIMEOUT_MS = 15_000;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/session/refresh", {
      method: "POST",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = (await response.json()) as ApiEnvelope<{ accessToken: string }>;
        setAccessToken(body.data.accessToken);
        return body.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function requestHeaders(options: ApiRequestOptions) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
  return headers;
}

async function send(path: string, options: ApiRequestOptions) {
  try {
    return await fetch(`/api/backend${path.startsWith("/") ? path : `/${path}`}`, {
      ...options,
      headers: requestHeaders(options),
      credentials: "same-origin",
      cache: "no-store",
      signal: options.signal ?? AbortSignal.timeout(CLIENT_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && ["AbortError", "TimeoutError"].includes(error.name)) {
      throw new ApiError(504, "REQUEST_TIMEOUT", "The server took too long to respond. Try again.");
    }
    throw error;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response = await send(path, options);
  if (response.status === 401 && !options.skipAuthRefresh && (await refreshAccessToken())) {
    response = await send(path, { ...options, skipAuthRefresh: true });
  }

  const requestId = response.headers.get("x-request-id") ?? undefined;
  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope
    | null;
  if (!response.ok || !body || body.success === false) {
    const errorBody = body && "error" in body ? body : null;
    if (response.status === 401) setAccessToken(null);
    throw new ApiError(
      response.status,
      errorBody?.error.code ?? "REQUEST_FAILED",
      errorBody?.error.message ?? "Glide could not complete this request.",
      errorBody?.error.details,
      errorBody?.meta?.requestId ?? requestId,
    );
  }

  return body.data;
}

export async function apiPageRequest<T>(path: string, options: ApiRequestOptions = {}) {
  let response = await send(path, options);
  if (response.status === 401 && !options.skipAuthRefresh && (await refreshAccessToken())) {
    response = await send(path, { ...options, skipAuthRefresh: true });
  }
  const body = (await response.json().catch(() => null)) as
    | (ApiEnvelope<T[]> & { pagination?: Pagination })
    | ApiErrorEnvelope
    | null;
  if (!response.ok || !body || body.success === false || !("data" in body)) {
    const errorBody = body && "error" in body ? body : null;
    if (response.status === 401) setAccessToken(null);
    throw new ApiError(
      response.status,
      errorBody?.error.code ?? "REQUEST_FAILED",
      errorBody?.error.message ?? "Glide could not complete this request.",
      errorBody?.error.details,
      errorBody?.meta?.requestId,
    );
  }
  return { items: body.data, pagination: body.pagination };
}

export function createIdempotencyKey(prefix = "glide") {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function queryString(values: Record<string, string | number | boolean | null | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
