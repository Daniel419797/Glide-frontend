"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest, createIdempotencyKey, getAccessToken } from "@/lib/api-client";
import { formatDateTime, humanize } from "@/lib/format";
import type { RequestRecord, RequestTask, TaskAction } from "@/types/backend";

function TaskPanel({ task, requestId }: { task: RequestTask; requestId: string }) {
  const [comments, setComments] = useState("");
  const { membership, companyPath } = useCompany();
  const queryClient = useQueryClient();
  const assigned = task.assignees.some(({ membershipId }) => membershipId === membership?.id);
  const alreadyActed = task.actions.some(
    ({ membershipId, action }) => membershipId === membership?.id && action !== "COMMENTED",
  );
  const mutation = useMutation({
    mutationFn: (action: TaskAction) =>
      apiRequest(companyPath(`/requests/tasks/${task.id}/actions`), {
        method: "POST",
        idempotencyKey: createIdempotencyKey("task"),
        body: JSON.stringify({
          action,
          comments: comments.trim() || undefined,
          clientRequestId: crypto.randomUUID(),
        }),
      }),
    onSuccess: async () => {
      setComments("");
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      toast.success("Task updated");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <section className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{task.workflowStep.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Step {task.workflowStep.order} · {humanize(task.workflowStep.assignmentMode)}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      {task.actions.length > 0 && (
        <div className="mt-4 space-y-2">
          {task.actions.map((action) => (
            <div key={action.id} className="rounded-md bg-muted/60 p-3 text-sm">
              <p>
                <strong>{action.membership.user.fullName}</strong>{" "}
                {humanize(action.action).toLowerCase()}
              </p>
              {action.comments && <p className="mt-1 text-muted-foreground">{action.comments}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(action.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
      {assigned && !alreadyActed && ["PENDING", "IN_PROGRESS"].includes(task.status) && (
        <div className="mt-4">
          <Textarea
            value={comments}
            maxLength={2000}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Optional comment"
            aria-label="Task comment"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("APPROVED")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("COMPLETED")}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={mutation.isPending || comments.trim().length < 2}
              onClick={() => mutation.mutate("REJECTED")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={mutation.isPending || comments.trim().length < 2}
              onClick={() => mutation.mutate("COMMENTED")}
            >
              Comment
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function RequestDetailPage() {
  const requestId = useParams<{ requestId: string }>().requestId;
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["request", companyId, requestId],
    queryFn: () => apiRequest<RequestRecord>(companyPath(`/requests/${requestId}`)),
    enabled: Boolean(companyId),
  });
  const download = async () => {
    const response = await fetch(
      `/api/backend${companyPath(`/requests/${requestId}/document/download`)}`,
      { headers: getAccessToken() ? { authorization: `Bearer ${getAccessToken()}` } : undefined },
    );
    if (!response.ok) return toast.error("Document is not ready yet");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `request-${requestId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const request = query.data;
  if (query.isLoading)
    return (
      <div className="p-4 sm:p-6">
        <TableSkeleton rows={8} />
      </div>
    );
  if (query.isError)
    return (
      <div className="p-4 sm:p-6">
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      </div>
    );
  if (!request) return null;
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title={request.form.name}
          description={`Request ${request.id.slice(0, 8)} · Submitted ${formatDateTime(request.createdAt)}`}
          actions={
            request.status === "APPROVED" ? (
              <Button variant="outline" onClick={() => void download()}>
                <DownloadIcon data-icon="inline-start" /> Download PDF
              </Button>
            ) : undefined
          }
        />
      </div>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 p-4 sm:p-6 lg:p-7">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current step</p>
              <p className="mt-2 font-medium">{request.currentStepOrder}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requester</p>
              <p className="mt-2 font-medium">{request.initiatedBy.user.fullName}</p>
            </div>
          </div>
          <Separator className="my-7" />
          <h2 className="text-base font-semibold">Submitted information</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {Object.entries(request.formData).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs text-muted-foreground">{humanize(key)}</dt>
                <dd className="mt-1.5 break-words text-sm leading-6">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value ?? "Not provided")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <aside className="space-y-4 border-t p-4 sm:p-6 xl:border-l xl:border-t-0 lg:p-7">
          <h2 className="text-base font-semibold">Workflow</h2>
          {request.tasks.map((task) => (
            <TaskPanel key={task.id} task={task} requestId={request.id} />
          ))}
        </aside>
      </div>
    </div>
  );
}
