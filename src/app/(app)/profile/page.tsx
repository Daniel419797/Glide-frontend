"use client";

import { CheckCircle2Icon, MailIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/auth-provider";
import { useCompany } from "@/features/company/company-provider";
import { formatDateTime, initials } from "@/lib/format";

export default function ProfilePage() {
  const { user } = useAuth();
  const { membership } = useCompany();
  if (!user) return null;
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader title="Profile" description="Your Glide identity and current company access." />
      </div>
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:p-7">
        <aside className="rounded-lg border p-5">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-lg font-semibold">{user.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-5">
            <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
          </div>
        </aside>
        <section className="space-y-6">
          <div className="rounded-lg border">
            <h2 className="border-b px-5 py-4 font-semibold">Account</h2>
            <dl className="divide-y">
              {[
                { icon: UserRoundIcon, label: "Full name", value: user.fullName },
                { icon: MailIcon, label: "Email", value: user.email },
                {
                  icon: CheckCircle2Icon,
                  label: "Email verified",
                  value: user.emailVerifiedAt
                    ? formatDateTime(user.emailVerifiedAt)
                    : "Not verified",
                },
                {
                  icon: ShieldCheckIcon,
                  label: "Platform access",
                  value: user.platformRole?.replaceAll("_", " ") ?? "Company member",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4" />
                    {label}
                  </dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-lg border">
            <h2 className="border-b px-5 py-4 font-semibold">Current company</h2>
            <dl className="divide-y">
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm text-muted-foreground">Workspace</dt>
                <dd className="text-sm font-medium">{membership?.company.name ?? "None"}</dd>
              </div>
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm text-muted-foreground">Roles</dt>
                <dd className="text-sm font-medium">
                  {membership?.roles.map(({ role }) => role.name).join(", ") || "None"}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
