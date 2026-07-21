"use client";

import { AlertCircleIcon, InboxIcon, RefreshCwIcon } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";

export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-60 bg-sidebar p-5 lg:block">
        <Skeleton className="h-8 w-24 bg-white/15" />
        <div className="mt-12 flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 bg-white/10" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-5 md:p-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-3 h-4 w-72" />
        <MetricSkeletonGrid />
        <TableSkeleton rows={7} />
      </div>
    </div>
  );
}

export function MetricSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-7 grid grid-cols-2 border-y md:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border-r p-5 last:border-r-0">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mt-7 overflow-hidden rounded-lg border" aria-label="Loading records">
      <div className="grid grid-cols-4 gap-4 border-b bg-muted/60 p-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 border-b p-4 last:border-b-0">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="mt-5 flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="rounded-lg border p-4">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-48" />
          <Skeleton className="mt-4 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  const message = error instanceof Error ? error.message : "This information could not be loaded.";
  const requestId = error instanceof ApiError ? error.requestId : undefined;
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>We couldn&apos;t load this area</AlertTitle>
      <AlertDescription>
        {message}
        {requestId ? (
          <span className="mt-1 block font-mono text-xs">Reference: {requestId}</span>
        ) : null}
      </AlertDescription>
      {retry ? (
        <AlertAction>
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCwIcon data-icon="inline-start" /> Retry
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Empty className="min-h-72 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
