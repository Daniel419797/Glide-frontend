"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/features/company/company-provider";
import { PERMISSIONS, type Permission } from "@/types/platform";

const routePermissions: Array<[string, Permission]> = [
  ["/admin/audit", PERMISSIONS.auditRead],
  ["/admin/forms", PERMISSIONS.formManage],
  ["/admin/organization", PERMISSIONS.departmentManage],
  ["/admin/reports", PERMISSIONS.reportRead],
  ["/admin/users", PERMISSIONS.memberRead],
];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hasPermission } = useCompany();
  const required = routePermissions.find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (!required || hasPermission(required)) return children;
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlertIcon />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Permission required</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your company role does not grant access to this area.
        </p>
        <Button className="mt-5" variant="outline" render={<Link href="/dashboard" />}>
          Return to dashboard
        </Button>
      </div>
    </div>
  );
}
