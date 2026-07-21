"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest, createIdempotencyKey } from "@/lib/api-client";
import { formatDateTime, humanize } from "@/lib/format";
import { PERMISSIONS } from "@/types/platform";

type Overview = {
  subscription: {
    planKey: string;
    status: string;
    limits: Record<string, number>;
    billingPeriodEnd: string | null;
  };
  usage: Array<{ metric: string; value: number; periodStart: string }>;
};

function openProvider(url: string) {
  const target = new URL(url);
  if (target.protocol !== "https:") throw new Error("Billing provider returned an invalid URL");
  window.location.assign(target.toString());
}

export default function BillingPage() {
  const { companyId, companyPath, hasPermission } = useCompany();
  const query = useQuery({
    queryKey: ["billing", companyId],
    queryFn: () => apiRequest<Overview>(companyPath("/billing")),
    enabled: Boolean(companyId),
  });
  const command = useMutation({
    mutationFn: async ({ route, planKey }: { route: "checkout" | "portal"; planKey?: string }) =>
      apiRequest<{ url: string }>(companyPath(`/billing/${route}`), {
        method: "POST",
        idempotencyKey: createIdempotencyKey("billing"),
        body: JSON.stringify(planKey ? { planKey } : {}),
      }),
    onSuccess: ({ url }) => {
      try {
        openProvider(url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Invalid billing URL");
      }
    },
    onError: (error) => toast.error(error.message),
  });
  const data = query.data;
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Billing"
          description="Subscription, current usage, and plan limits."
          actions={
            data && hasPermission(PERMISSIONS.billingManage) ? (
              <Button
                variant="outline"
                disabled={command.isPending}
                onClick={() => command.mutate({ route: "portal" })}
              >
                Manage billing <ExternalLinkIcon data-icon="inline-end" />
              </Button>
            ) : undefined
          }
        />
      </div>
      {query.isLoading && (
        <div className="p-6">
          <TableSkeleton rows={6} />
        </div>
      )}
      {query.isError && (
        <div className="p-6">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {data && (
        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-7">
          <section className="rounded-lg border">
            <div className="flex items-start justify-between gap-4 border-b p-5">
              <div>
                <p className="text-xs text-muted-foreground">Current plan</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {humanize(data.subscription.planKey)}
                </h2>
              </div>
              <StatusBadge status={data.subscription.status} />
            </div>
            <div className="divide-y">
              {Object.entries(data.subscription.limits).map(([metric, limit]) => {
                const used = data.usage.find((item) => item.metric === metric)?.value ?? 0;
                return (
                  <div key={metric} className="p-5">
                    <div className="flex justify-between text-sm">
                      <span>{humanize(metric)}</span>
                      <span className="tabular-nums">
                        {used.toLocaleString()} / {limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, limit ? (used / limit) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <aside className="space-y-4">
            <div className="rounded-lg border p-5">
              <p className="text-xs text-muted-foreground">Billing period ends</p>
              <p className="mt-2 font-medium">
                {data.subscription.billingPeriodEnd
                  ? formatDateTime(data.subscription.billingPeriodEnd)
                  : "Not scheduled"}
              </p>
            </div>
            {hasPermission(PERMISSIONS.billingManage) && (
              <div className="rounded-lg border p-5">
                <h2 className="font-semibold">Change plan</h2>
                <div className="mt-4 grid gap-2">
                  {["STARTER", "GROWTH", "ENTERPRISE"]
                    .filter((plan) => plan !== data.subscription.planKey)
                    .map((plan) => (
                      <Button
                        key={plan}
                        variant="outline"
                        disabled={command.isPending}
                        onClick={() => command.mutate({ route: "checkout", planKey: plan })}
                      >
                        Choose {humanize(plan)}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
