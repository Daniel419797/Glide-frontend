import { Badge } from "@/components/ui/badge";
import { humanize } from "@/lib/format";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const variants: Record<string, BadgeVariant> = {
  DRAFT: "outline",
  IN_REVIEW: "info",
  CHANGES_REQUESTED: "warning",
  CLOSED: "success",
  REJECTED: "destructive",
  CANCELED: "secondary",
  READY: "info",
  CLAIMED: "warning",
  BLOCKED: "destructive",
  COMPLETED: "success",
  PENDING: "warning",
  ACTIVE: "success",
  INACTIVE: "secondary",
  SENT: "success",
  FAILED: "destructive",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge variant={variants[status] ?? "secondary"}>{label ?? humanize(status)}</Badge>;
}
