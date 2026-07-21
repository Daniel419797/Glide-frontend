"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-provider";
import type { CompanyMembershipSummary, Permission } from "@/types/platform";

const STORAGE_KEY = "glide:selected-company";

interface CompanyContextValue {
  memberships: CompanyMembershipSummary[];
  membership: CompanyMembershipSummary | null;
  companyId: string | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  selectCompany: (companyId: string) => void;
  hasPermission: (...permissions: Permission[]) => boolean;
  companyPath: (path: string) => string;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY),
  );
  const query = useQuery({
    queryKey: ["companies"],
    queryFn: () => apiRequest<CompanyMembershipSummary[]>("/companies"),
    enabled: status === "authenticated",
    staleTime: 60_000,
  });
  const { refetch } = query;

  const membership = useMemo(
    () => query.data?.find(({ company }) => company.id === selectedId) ?? query.data?.[0] ?? null,
    [query.data, selectedId],
  );
  const permissionSet = useMemo(
    () =>
      new Set(
        membership?.roles.flatMap(({ role }) =>
          role.permissions.map(({ permission }) => permission.key),
        ) ?? [],
      ),
    [membership],
  );

  const value = useMemo<CompanyContextValue>(
    () => ({
      memberships: query.data ?? [],
      membership,
      companyId: membership?.company.id ?? null,
      isLoading: query.isLoading || (Boolean(query.data?.length) && !membership),
      error: query.error,
      retry: () => void refetch(),
      selectCompany: (companyId) => {
        if (!query.data?.some(({ company }) => company.id === companyId)) return;
        window.localStorage.setItem(STORAGE_KEY, companyId);
        setSelectedId(companyId);
      },
      hasPermission: (...permissions) =>
        permissions.every((permission) => permissionSet.has(permission)),
      companyPath: (path) => {
        if (!membership) throw new Error("Company context is unavailable");
        return `/companies/${membership.company.id}${path.startsWith("/") ? path : `/${path}`}`;
      },
    }),
    [membership, permissionSet, query.data, query.error, query.isLoading, refetch],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error("useCompany must be used within CompanyProvider");
  return context;
}
