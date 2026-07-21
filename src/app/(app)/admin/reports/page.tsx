"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock3Icon, FileTextIcon, ListTodoIcon } from "lucide-react";
import { ErrorNotice, MetricSkeletonGrid } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest } from "@/lib/api-client";
import { humanize } from "@/lib/format";
import type { CompanyMetrics } from "@/types/backend";

export default function CompanyReportsPage() {
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["company-report", companyId],
    queryFn: () => apiRequest<CompanyMetrics>(companyPath("/reports/company")),
    enabled: Boolean(companyId),
  });
  const data = query.data;
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Company Reports"
          description="Request throughput, workload, and resolution metrics."
        />
      </div>
      {query.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <MetricSkeletonGrid />
        </div>
      )}
      {query.isError && (
        <div className="p-4 sm:p-6">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {data && (
        <>
          <section className="grid border-b sm:grid-cols-3">
            {[
              { label: "Total requests", value: data.totalRequests, icon: FileTextIcon },
              { label: "Open tasks", value: data.openTasks, icon: ListTodoIcon },
              {
                label: "Average resolution",
                value: `${data.averageResolutionHours.toFixed(1)}h`,
                icon: Clock3Icon,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="border-b p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6 lg:px-7"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Icon className="size-5 text-primary" />
                  <strong className="text-3xl tabular-nums">{value}</strong>
                </div>
              </div>
            ))}
          </section>
          <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:p-7">
            <section>
              <h2 className="font-semibold">Requests by status</h2>
              <div className="mt-3 divide-y border-y">
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-3 text-sm">
                    <StatusBadge status={status} />
                    <strong className="tabular-nums">{count}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-semibold">Most used forms</h2>
              <div className="mt-3 divide-y border-y">
                {data.byForm.map((form) => (
                  <div key={form.formId} className="flex justify-between gap-3 py-3 text-sm">
                    <span>{form.name ?? humanize(form.formId)}</span>
                    <strong className="tabular-nums">{form.count}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
