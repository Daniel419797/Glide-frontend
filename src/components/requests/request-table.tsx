import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { RequestListItem } from "@/types/backend";

export function RequestTable({ requests }: { requests: RequestListItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto border-y md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Form</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Current step</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="w-16">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-muted/35">
                <td className="px-6 py-4">
                  <Link href={`/requests/${request.id}`} className="font-medium hover:text-primary">
                    {request.form.name}
                  </Link>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {request.id.slice(0, 8)}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-4 tabular-nums">Step {request.currentStepOrder}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatDateTime(request.updatedAt)}
                </td>
                <td className="pr-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Open ${request.form.name}`}
                    render={<Link href={`/requests/${request.id}`} />}
                  >
                    <ChevronRightIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y border-y md:hidden">
        {requests.map((request) => (
          <Link
            key={request.id}
            href={`/requests/${request.id}`}
            className="block p-4 hover:bg-muted/35"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{request.form.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Step {request.currentStepOrder} · Updated {formatDateTime(request.updatedAt)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
