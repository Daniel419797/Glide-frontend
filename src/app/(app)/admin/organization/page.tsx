"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
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
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest } from "@/lib/api-client";
import { humanize } from "@/lib/format";
import type { OrganizationRecord } from "@/types/backend";

type Resource = "departments" | "positions" | "teams";

function CreateDialog({ resource }: { resource: Resource }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { companyId, companyPath } = useCompany();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest(companyPath(`/organization/${resource}`), {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      }),
    onSuccess: async () => {
      setOpen(false);
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["organization", companyId, resource] });
      toast.success(`${humanize(resource.slice(0, -1))} created`);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon data-icon="inline-start" /> Add {humanize(resource.slice(0, -1)).toLowerCase()}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {humanize(resource.slice(0, -1)).toLowerCase()}</DialogTitle>
          <DialogDescription>Names must be unique inside this company.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`new-${resource}`}>Name</Label>
            <Input
              id={`new-${resource}`}
              value={name}
              required
              minLength={2}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
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
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResourcePanel({ resource }: { resource: Resource }) {
  const { companyId, companyPath } = useCompany();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["organization", companyId, resource],
    queryFn: () => apiRequest<OrganizationRecord[]>(companyPath(`/organization/${resource}`)),
    enabled: Boolean(companyId),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest(companyPath(`/organization/${resource}/${id}`), { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization", companyId, resource] });
      toast.success("Record removed");
    },
    onError: (error) => toast.error(error.message),
  });
  if (query.isLoading) return <TableSkeleton rows={6} />;
  if (query.isError) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CreateDialog resource={resource} />
      </div>
      {query.data?.length ? (
        <div className="divide-y border-y">
          {query.data.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-1 py-3 sm:px-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.manager?.user.fullName
                    ? `Managed by ${item.manager.user.fullName}`
                    : item._count
                      ? `${item._count.members} members`
                      : "No additional details"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${item.name}`}
                disabled={remove.isPending}
                onClick={() => {
                  if (
                    window.confirm(`Delete ${item.name}? This is allowed only when it is unused.`)
                  )
                    remove.mutate(item.id);
                }}
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${resource}`}
          description={`Create the first ${humanize(resource.slice(0, -1)).toLowerCase()} for this company.`}
        />
      )}
    </div>
  );
}

export default function OrganizationPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Organization"
          description="Maintain departments, positions, and teams used for workflow assignment."
        />
      </div>
      <div className="p-4 sm:p-6 lg:p-7">
        <Tabs defaultValue="departments">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
          <TabsPanel value="departments" className="pt-6">
            <ResourcePanel resource="departments" />
          </TabsPanel>
          <TabsPanel value="positions" className="pt-6">
            <ResourcePanel resource="positions" />
          </TabsPanel>
          <TabsPanel value="teams" className="pt-6">
            <ResourcePanel resource="teams" />
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
