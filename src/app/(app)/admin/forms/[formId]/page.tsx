"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  fieldsToSchema,
  FormQuestionBuilder,
  schemaToFields,
  WorkflowBuilder,
} from "@/components/forms/visual-builders";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest } from "@/lib/api-client";
import type { FormRecord, WorkflowStep, WorkflowTemplate } from "@/types/backend";

const DEFAULT_STEPS: WorkflowStep[] = [
  {
    order: 1,
    name: "Manager approval",
    assignmentMode: "ANY",
    targets: [{ type: "REQUESTER_MANAGER" }],
  },
];

function FormEditor({
  form,
  formId,
  companyId,
  companyPath,
  reload,
}: {
  form: FormRecord;
  formId: string;
  companyId: string;
  companyPath: (path: string) => string;
  reload: () => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description ?? "");
  const [fields, setFields] = useState(() => schemaToFields(form.schema));
  const [steps, setSteps] = useState<WorkflowStep[]>(DEFAULT_STEPS);
  const save = useMutation({
    mutationFn: () =>
      apiRequest(companyPath(`/forms/${formId}`), {
        method: "PATCH",
        body: JSON.stringify({
          name,
          description: description || null,
          schema: fieldsToSchema(fields),
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-form", companyId, formId] });
      toast.success("Form saved");
    },
    onError: (error) => toast.error(error.message),
  });
  const createWorkflow = useMutation({
    mutationFn: () =>
      apiRequest<WorkflowTemplate>(companyPath(`/forms/${formId}/workflows`), {
        method: "POST",
        body: JSON.stringify({ steps }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-form", companyId, formId] });
      toast.success("Draft workflow created");
    },
    onError: (error) => toast.error(error.message),
  });
  const publish = useMutation({
    mutationFn: (workflowId: string) =>
      apiRequest(companyPath(`/forms/${formId}/workflows/${workflowId}/publish`), {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-form", companyId, formId] });
      toast.success("Workflow published");
    },
  });
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title={form.name}
          description="Build the questions requesters answer and the approval path each submission follows."
          actions={
            <Button disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving..." : "Save form"}
            </Button>
          }
        />
      </div>
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-2 lg:p-7">
        <section className="space-y-4">
          <h2 className="font-semibold">Form configuration</h2>
          <div className="space-y-2">
            <Label htmlFor="edit-form-name">Name</Label>
            <Input
              id="edit-form-name"
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-form-description">Description</Label>
            <Textarea
              id="edit-form-description"
              value={description}
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <FormQuestionBuilder fields={fields} onChange={setFields} />
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="form-active">Available to requesters</Label>
            <Switch
              id="form-active"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                void apiRequest(companyPath(`/forms/${formId}`), {
                  method: "PATCH",
                  body: JSON.stringify({ isActive: checked }),
                }).then(reload)
              }
            />
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="font-semibold">Workflow versions</h2>
          <div className="space-y-3">
            {form.workflowTemplates?.map((workflow) => (
              <div key={workflow.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Version {workflow.version}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {workflow.steps.length} steps
                    </p>
                  </div>
                  <StatusBadge status={workflow.status} />
                </div>
                {workflow.status === "DRAFT" && (
                  <Button
                    className="mt-4"
                    size="sm"
                    disabled={publish.isPending}
                    onClick={() => publish.mutate(workflow.id)}
                  >
                    Publish version
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t pt-5">
            <WorkflowBuilder steps={steps} onChange={setSteps} />
            <Button
              variant="outline"
              disabled={createWorkflow.isPending}
              onClick={() => createWorkflow.mutate()}
            >
              {createWorkflow.isPending ? "Creating..." : "Create draft version"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function FormDetailPage() {
  const formId = useParams<{ formId: string }>().formId;
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["admin-form", companyId, formId],
    queryFn: () => apiRequest<FormRecord>(companyPath(`/forms/${formId}`)),
    enabled: Boolean(companyId),
  });
  if (query.isLoading)
    return (
      <div className="p-6">
        <TableSkeleton rows={8} />
      </div>
    );
  if (query.isError)
    return (
      <div className="p-6">
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      </div>
    );
  if (!query.data || !companyId) return null;
  return (
    <FormEditor
      key={query.data.updatedAt}
      form={query.data}
      formId={formId}
      companyId={companyId}
      companyPath={companyPath}
      reload={query.refetch}
    />
  );
}
