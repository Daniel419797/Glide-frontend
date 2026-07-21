"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompany } from "@/features/company/company-provider";
import { apiPageRequest, apiRequest } from "@/lib/api-client";
import type { FormRecord } from "@/types/backend";

function CreateFormDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { companyId, companyPath } = useCompany();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<FormRecord>(companyPath("/forms"), {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || null,
          schema: { type: "object", additionalProperties: false, properties: {}, required: [] },
        }),
      }),
    onSuccess: async () => {
      setOpen(false);
      setName("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["admin-forms", companyId] });
      toast.success("Form created");
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" /> New form
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create form</DialogTitle>
          <DialogDescription>Define fields and workflow after creating the form.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="form-name">Name</Label>
            <Input
              id="form-name"
              value={name}
              required
              minLength={2}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={description}
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create form"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFormsPage() {
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["admin-forms", companyId],
    queryFn: () => apiPageRequest<FormRecord>(companyPath("/forms?pageSize=100")),
    enabled: Boolean(companyId),
  });
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Form Builder"
          description="Manage request schemas and versioned approval workflows."
          actions={<CreateFormDialog />}
        />
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
      {query.data?.items.length ? (
        <div className="divide-y border-b">
          {query.data.items.map((form) => (
            <Link
              key={form.id}
              href={`/admin/forms/${form.id}`}
              className="grid gap-3 px-4 py-4 hover:bg-muted/35 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6 lg:px-7"
            >
              <div>
                <p className="font-medium">{form.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {form.description ?? "No description"}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {form._count?.workflowTemplates ?? 0} versions · {form._count?.requests ?? 0}{" "}
                requests
              </div>
              <StatusBadge status={form.isActive ? "ACTIVE" : "INACTIVE"} />
            </Link>
          ))}
        </div>
      ) : null}
      {query.data && query.data.items.length === 0 && (
        <div className="p-6">
          <EmptyState title="No forms" description="Create the first form for this company." />
        </div>
      )}
    </div>
  );
}
