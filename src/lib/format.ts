import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";

export function formatDate(value?: string | null, pattern = "MMM d, yyyy") {
  if (!value) return "—";
  return format(parseISO(value), pattern);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return format(parseISO(value), "MMM d, yyyy · h:mm a");
}

export function formatRelative(value?: string | null) {
  if (!value) return "—";
  return formatDistanceToNow(parseISO(value), { addSuffix: true });
}

export function getDueLabel(value?: string | null) {
  if (!value) return { primary: "No due date", secondary: "", overdue: false };
  const date = parseISO(value);
  const overdue = isPast(date);
  return {
    primary: format(date, "MMM d, yyyy"),
    secondary: overdue ? "Overdue" : formatDistanceToNow(date, { addSuffix: true }),
    overdue,
  };
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function humanize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
