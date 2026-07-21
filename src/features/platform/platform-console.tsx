"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIcon, Building2Icon, LogOutIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { ErrorNotice, MetricSkeletonGrid, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { apiPageRequest, apiRequest, queryString } from "@/lib/api-client";

type Company = {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscription: { planKey: string; status: string } | null;
  _count: { memberships: number; requests: number; forms: number };
};
type Operations = {
  companies: number;
  activeCompanies: number;
  activeUsers: number;
  unresolvedNotifications: number;
  queues: Record<string, Record<string, number>>;
};

export function PlatformConsole() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const queryClient = useQueryClient();
  const operations = useQuery({
    queryKey: ["platform-operations"],
    queryFn: () => apiRequest<Operations>("/platform/operations"),
    enabled: Boolean(user?.platformRole && user.platformRole !== "BILLING"),
  });
  const companies = useQuery({
    queryKey: ["platform-companies", deferredSearch],
    queryFn: () =>
      apiPageRequest<Company>(
        `/platform/companies${queryString({ search: deferredSearch, pageSize: 100 })}`,
      ),
    enabled: Boolean(user?.platformRole),
  });
  const status = useMutation({
    mutationFn: ({ companyId, next }: { companyId: string; next: string }) =>
      apiRequest(`/platform/companies/${companyId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next, reason: "Changed by platform operator console" }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["platform-companies"] });
      toast.success("Company status updated");
    },
    onError: (error) => toast.error(error.message),
  });
  const metrics = operations.data
    ? [
        { label: "Companies", value: operations.data.companies, icon: Building2Icon },
        { label: "Active companies", value: operations.data.activeCompanies, icon: ActivityIcon },
        { label: "Active users", value: operations.data.activeUsers, icon: UsersIcon },
      ]
    : [];
  if (!user?.platformRole) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Platform access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This console is limited to authorized Glide platform operators.
          </p>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Platform Operations"
          description={`${user?.platformRole?.replaceAll("_", " ")} access across Glide companies.`}
          actions={
            <Button variant="outline" onClick={() => void logout()}>
              <LogOutIcon data-icon="inline-start" /> Sign out
            </Button>
          }
        />
      </div>
      {operations.isLoading && (
        <div className="px-4 sm:px-6 lg:px-8">
          <MetricSkeletonGrid />
        </div>
      )}
      {operations.data && (
        <section className="grid border-b sm:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="border-b p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6 lg:px-8"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className="mt-3 flex items-center gap-3">
                <Icon className="size-5 text-primary" />
                <strong className="text-3xl tabular-nums">{value}</strong>
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Companies</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tenant status, plan, and activity totals.
            </p>
          </div>
          <label className="text-xs text-muted-foreground">
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="ml-2 h-9 rounded-md border bg-background px-3 text-sm text-foreground"
            />
          </label>
        </div>
        {companies.isLoading && <TableSkeleton rows={8} />}
        {companies.isError && (
          <ErrorNotice error={companies.error} retry={() => void companies.refetch()} />
        )}
        {companies.data && (
          <div className="overflow-x-auto border-y">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Usage</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {companies.data.items.map((company) => (
                  <tr key={company.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.slug}</p>
                    </td>
                    <td className="px-4 py-4">{company.subscription?.planKey ?? "None"}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {company._count.memberships} members · {company._count.requests} requests ·{" "}
                      {company._count.forms} forms
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-4">
                      {user?.platformRole === "SUPER_ADMIN" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={status.isPending}
                          onClick={() =>
                            status.mutate({
                              companyId: company.id,
                              next: company.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                            })
                          }
                        >
                          {company.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
