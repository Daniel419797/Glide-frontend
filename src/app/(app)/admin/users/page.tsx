"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MailPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, ErrorNotice, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { useCompany } from "@/features/company/company-provider";
import { apiPageRequest, apiRequest } from "@/lib/api-client";
import type { MemberRecord, RoleRecord } from "@/types/backend";
import { PERMISSIONS } from "@/types/platform";

function InviteDialog({ roles }: { roles: RoleRecord[] }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(
    roles.find((role) => role.systemKey === "MEMBER")?.id ?? roles[0]?.id ?? "",
  );
  const { companyPath } = useCompany();
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest(companyPath("/invitations"), {
        method: "POST",
        body: JSON.stringify({ email, roleIds: [roleId] }),
      }),
    onSuccess: () => {
      setOpen(false);
      setEmail("");
      toast.success("Invitation sent");
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <MailPlusIcon data-icon="inline-start" /> Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>An email invitation will expire after seven days.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
            >
              {roles
                .filter((role) => role.systemKey !== "COMPANY_OWNER")
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
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
            <Button type="submit" disabled={!roleId || mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const { companyId, companyPath, hasPermission } = useCompany();
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: ["members", companyId],
    queryFn: () => apiPageRequest<MemberRecord>(companyPath("/members?pageSize=100")),
    enabled: Boolean(companyId),
  });
  const roles = useQuery({
    queryKey: ["roles", companyId],
    queryFn: () => apiRequest<RoleRecord[]>(companyPath("/roles")),
    enabled: Boolean(companyId),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MemberRecord["status"] }) =>
      apiRequest(companyPath(`/members/${id}`), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members", companyId] });
      toast.success("Member updated");
    },
  });
  const items = members.data?.items ?? [];
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Members"
          description="Manage company access and invitations."
          actions={
            hasPermission(PERMISSIONS.memberInvite) && roles.data ? (
              <InviteDialog roles={roles.data} />
            ) : undefined
          }
        />
      </div>
      {members.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <TableSkeleton rows={8} />
        </div>
      )}
      {members.isError && (
        <div className="p-4 sm:p-6">
          <ErrorNotice error={members.error} retry={() => void members.refetch()} />
        </div>
      )}
      {items.length > 0 && (
        <div className="overflow-x-auto border-b">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Roles</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium">{member.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    {member.roles.map(({ role }) => role.name).join(", ")}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {member.department?.name ?? "Unassigned"}
                    {member.position ? ` · ${member.position.name}` : ""}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-4">
                    {hasPermission(PERMISSIONS.memberManage) &&
                    member.id !==
                      items.find((item) =>
                        item.roles.some(({ role }) => role.systemKey === "COMPANY_OWNER"),
                      )?.id ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: member.id,
                            status: member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                          })
                        }
                      >
                        {member.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {members.data && items.length === 0 && (
        <div className="p-6">
          <EmptyState title="No members" description="Invite the first member to this company." />
        </div>
      )}
    </div>
  );
}
