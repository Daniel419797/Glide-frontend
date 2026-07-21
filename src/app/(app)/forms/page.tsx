"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileTextIcon, SearchIcon } from "lucide-react";
import { RequestCreateDialog } from "@/components/forms/request-create-dialog";
import { EmptyState, ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useCompany } from "@/features/company/company-provider";
import { apiPageRequest } from "@/lib/api-client";
import { PERMISSIONS } from "@/types/platform";
import type { FormRecord } from "@/types/backend";

export default function FormsPage() {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search.trim().toLowerCase());
  const { companyId, companyPath, hasPermission } = useCompany();
  const query = useQuery({
    queryKey: ["forms", companyId],
    queryFn: () => apiPageRequest<FormRecord>(companyPath("/forms?pageSize=100&isActive=true")),
    enabled: Boolean(companyId),
  });
  const forms =
    query.data?.items.filter(
      (form) =>
        !deferred || `${form.name} ${form.description ?? ""}`.toLowerCase().includes(deferred),
    ) ?? [];
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader title="Forms" description="Start a request using an active company workflow." />
      </div>
      <div className="px-4 py-5 sm:px-6 lg:px-7">
        <InputGroup className="max-w-md">
          <InputGroupInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search forms"
            aria-label="Search forms"
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      {query.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <TableSkeleton rows={5} />
        </div>
      )}
      {query.isError && (
        <div className="px-4 sm:px-6 lg:px-7">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {forms.length > 0 && (
        <div className="grid gap-3 px-4 pb-8 sm:grid-cols-2 sm:px-6 xl:grid-cols-3 lg:px-7">
          {forms.map((form) => (
            <article
              key={form.id}
              className="flex min-h-44 flex-col rounded-lg border bg-background p-5"
            >
              <FileTextIcon className="size-5 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{form.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {form.description ?? "No description provided."}
              </p>
              <div className="mt-auto pt-5">
                {hasPermission(PERMISSIONS.requestCreate) ? (
                  <RequestCreateDialog form={form} />
                ) : (
                  <p className="text-xs text-muted-foreground">Your role cannot create requests.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {query.data && forms.length === 0 && (
        <div className="px-4 sm:px-6 lg:px-7">
          <EmptyState
            title="No matching forms"
            description={
              search ? "Try a different search term." : "No active forms have been published yet."
            }
          />
        </div>
      )}
    </div>
  );
}
