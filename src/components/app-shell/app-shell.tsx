"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3Icon,
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FilePlus2Icon,
  FilesIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ErrorNotice } from "@/components/shared/data-states";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { CompanySetup } from "@/features/company/company-setup";
import { useAuth } from "@/features/auth/auth-provider";
import { useCompany } from "@/features/company/company-provider";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PERMISSIONS, type Permission } from "@/types/platform";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboardIcon;
  permission?: Permission;
};

const navigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Forms", href: "/forms", icon: FilesIcon },
  { label: "Requests", href: "/requests", icon: ClipboardListIcon },
  { label: "Reports", href: "/reports", icon: BarChart3Icon },
];

const administration: NavItem[] = [
  { label: "Members", href: "/admin/users", icon: UsersIcon, permission: PERMISSIONS.memberRead },
  {
    label: "Organization",
    href: "/admin/organization",
    icon: Building2Icon,
    permission: PERMISSIONS.departmentManage,
  },
  {
    label: "Form Builder",
    href: "/admin/forms",
    icon: FilePlus2Icon,
    permission: PERMISSIONS.formManage,
  },
  {
    label: "Billing",
    href: "/settings/billing",
    icon: CreditCardIcon,
    permission: PERMISSIONS.billingRead,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit",
    icon: ScrollTextIcon,
    permission: PERMISSIONS.auditRead,
  },
  {
    label: "Company Reports",
    href: "/admin/reports",
    icon: BarChart3Icon,
    permission: PERMISSIONS.reportRead,
  },
];

function CompanyPicker() {
  const { companyId, memberships, selectCompany } = useCompany();
  if (memberships.length < 2) return null;
  return (
    <div className="px-3 pb-2">
      <label htmlFor="company-picker" className="sr-only">
        Active company
      </label>
      <select
        id="company-picker"
        value={companyId ?? ""}
        onChange={(event) => selectCompany(event.target.value)}
        className="h-9 w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        {memberships.map(({ company }) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Navigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { hasPermission } = useCompany();
  const { user } = useAuth();
  const renderItem = (item: NavItem) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    const link = (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white",
          active && "bg-sidebar-accent text-white",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
    return collapsed ? (
      <Tooltip key={item.href}>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    ) : (
      <div key={item.href}>{link}</div>
    );
  };
  const adminItems = administration.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );
  return (
    <nav
      className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-3 scrollbar-subtle"
      aria-label="Primary navigation"
    >
      {navigation.map(renderItem)}
      {user?.platformRole
        ? renderItem({ label: "Platform", href: "/platform", icon: ShieldCheckIcon })
        : null}
      {adminItems.length > 0 && (
        <>
          <div
            className={cn(
              "px-3 pb-1 pt-5 text-[10px] font-semibold uppercase text-sidebar-foreground/45",
              collapsed && "sr-only",
            )}
          >
            Administration
          </div>
          {adminItems.map(renderItem)}
        </>
      )}
      <div className="mt-auto flex items-center gap-1 pt-4">
        {renderItem({ label: "Profile", href: "/profile", icon: UserRoundIcon })}
        <ThemeToggle />
      </div>
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn("flex h-16 items-center px-5 text-white", collapsed && "justify-center px-0")}
    >
      <span className={collapsed ? "text-xl font-semibold" : "text-2xl font-semibold"}>
        {collapsed ? "G" : "Glide"}
      </span>
    </Link>
  );
}

function UserMenu({ collapsed }: { collapsed?: boolean }) {
  const { user, logout } = useAuth();
  const { membership } = useCompany();
  const router = useRouter();
  if (!user) return null;
  const role =
    membership?.roles[0]?.role.name ?? user.platformRole?.replaceAll("_", " ") ?? "Member";
  return (
    <div className="border-t border-sidebar-border p-3">
      <div
        className={cn("flex items-center gap-3 rounded-md p-2", collapsed && "justify-center p-1")}
      >
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user.fullName}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">{role}</p>
          </div>
        )}
        {!collapsed && (
          <Button
            aria-label="Log out"
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white"
            onClick={() => void logout().then(() => router.replace("/login"))}
          >
            <LogOutIcon />
          </Button>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { memberships, isLoading, error, retry } = useCompany();
  if (!isLoading && error)
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
        <ErrorNotice error={error} retry={retry} />
      </main>
    );
  if (!isLoading && memberships.length === 0) return <CompanySetup />;
  return (
    <div
      className="min-h-screen bg-background lg:pl-[var(--shell-sidebar-width)]"
      style={{ "--shell-sidebar-width": collapsed ? "72px" : "240px" } as React.CSSProperties}
    >
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <Brand collapsed={collapsed} />
        {!collapsed && <CompanyPicker />}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-3 top-5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </Button>
        <Navigation collapsed={collapsed} />
        <UserMenu collapsed={collapsed} />
      </aside>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </Button>
        <Link href="/dashboard" className="text-lg font-semibold">
          Glide
        </Link>
        <div className="flex items-center">
          <ThemeToggle />
          <span className="size-1" />
        </div>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[min(88vw,320px)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Glide navigation</SheetTitle>
            <SheetDescription>Navigate Glide</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <Brand />
            <CompanyPicker />
            <Separator className="bg-sidebar-border" />
            <Navigation onNavigate={() => setMobileOpen(false)} />
            <UserMenu />
          </div>
        </SheetContent>
      </Sheet>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
