"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { useCompany } from "@/features/company/company-provider";
import { apiPageRequest } from "@/lib/api-client";
import { formatDateTime, humanize } from "@/lib/format";
import type { AuditRecord } from "@/types/backend";

export default function AuditPage() {
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["audit", companyId],
    queryFn: () => apiPageRequest<AuditRecord>(companyPath("/audit-logs?pageSize=100")),
    enabled: Boolean(companyId),
  });
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Audit Logs"
          description="Immutable company security and workflow events."
        />
      </div>
      {query.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <TableSkeleton rows={9} />
        </div>
      )}
      {query.isError && (
        <div className="p-4 sm:p-6">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {query.data && (
        <div className="overflow-x-auto border-b">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Occurred</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.data.items.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 font-medium">{humanize(event.action)}</td>
                  <td className="px-4 py-4">
                    <p>{event.membership?.user.fullName ?? "System"}</p>
                    <p className="text-xs text-muted-foreground">{event.membership?.user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{humanize(event.resourceType)}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {event.resourceId?.slice(0, 12) ?? "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {query.data.items.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No audit events have been recorded.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
