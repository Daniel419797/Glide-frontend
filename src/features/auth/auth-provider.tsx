"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest, getAccessToken, setAccessToken } from "@/lib/api-client";
import type { SessionProfile } from "@/types/platform";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: SessionProfile | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (payload: LoginPayload) => Promise<SessionProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<SessionProfile>;
  hasPlatformRole: (...roles: NonNullable<SessionProfile["platformRole"]>[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function refreshSession() {
  const response = await fetch("/api/session/refresh", {
    method: "POST",
    credentials: "same-origin",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Session unavailable");
  const body = (await response.json()) as { data: { accessToken: string } };
  setAccessToken(body.data.accessToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionProfile | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const queryClient = useQueryClient();

  const refreshProfile = useCallback(async () => {
    const profile = await apiRequest<SessionProfile>("/auth/profile");
    setUser(profile);
    setStatus("authenticated");
    return profile;
  }, []);

  useEffect(() => {
    let active = true;
    void refreshSession()
      .then(() => refreshProfile())
      .catch(() => {
        if (!active || getAccessToken()) return;
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await fetch("/api/session/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as {
      data?: { accessToken: string; profile: SessionProfile };
      error?: { message?: string };
    } | null;
    if (!response.ok || !body?.data) throw new Error(body?.error?.message ?? "Unable to sign in");
    setAccessToken(body.data.accessToken);
    setUser(body.data.profile);
    setStatus("authenticated");
    return body.data.profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/session/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: getAccessToken() ? { authorization: `Bearer ${getAccessToken()}` } : undefined,
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("unauthenticated");
      queryClient.clear();
    }
  }, [queryClient]);

  const hasPlatformRole = useCallback(
    (...roles: NonNullable<SessionProfile["platformRole"]>[]) =>
      Boolean(user?.platformRole && roles.includes(user.platformRole)),
    [user],
  );

  const value = useMemo(
    () => ({ user, status, login, logout, refreshProfile, hasPlatformRole }),
    [hasPlatformRole, login, logout, refreshProfile, status, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
