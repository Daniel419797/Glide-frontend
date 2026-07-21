"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { RequestTable } from "@/components/requests/request-table";
import { EmptyState, ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/features/company/company-provider";
import { apiPageRequest, queryString } from "@/lib/api-client";
import type { RequestListItem, RequestStatus } from "@/types/backend";

const filters: Array<{ value: "ALL" | RequestStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function RequestsPage() {
  const [status, setStatus] = useState<(typeof filters)[number]["value"]>("ALL");
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["requests", companyId, status],
    queryFn: () =>
      apiPageRequest<RequestListItem>(
        companyPath(
          `/requests${queryString({ status: status === "ALL" ? undefined : status, pageSize: 50 })}`,
        ),
      ),
    enabled: Boolean(companyId),
  });
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Requests"
          description="Track requests you submitted or are assigned to review."
          actions={
            <Button render={<Link href="/forms" />}>
              <PlusIcon data-icon="inline-start" /> New request
            </Button>
          }
        />
      </div>
      <div className="border-b px-4 py-3 sm:px-6 lg:px-7">
        <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <TabsList variant="line" className="max-w-full overflow-x-auto">
            {filters.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {query.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <TableSkeleton rows={7} />
        </div>
      )}
      {query.isError && (
        <div className="p-4 sm:p-6">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {query.data?.items.length ? <RequestTable requests={query.data.items} /> : null}
      {query.data && query.data.items.length === 0 && (
        <div className="p-4 sm:p-6">
          <EmptyState
            title="No requests here"
            description="No requests match this status in the current company."
            action={
              status === "ALL" ? (
                <Button render={<Link href="/forms" />}>Browse forms</Button>
              ) : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
