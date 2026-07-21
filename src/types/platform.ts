export type PlatformRole = "SUPER_ADMIN" | "SUPPORT" | "BILLING";
export type CompanyStatus = "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CLOSED";

export interface CompanyReference {
  id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  ownerMembershipId?: string | null;
}

export interface SessionMembership {
  id: string;
  company: CompanyReference;
}

export interface SessionProfile {
  id: string;
  email: string;
  fullName: string;
  platformRole: PlatformRole | null;
  emailVerifiedAt: string | null;
  isActive: boolean;
  memberships: SessionMembership[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRoleSummary {
  id: string;
  name: string;
  systemKey: string | null;
  permissions: Array<{ permission: { key: string } }>;
}

export interface CompanyMembershipSummary {
  id: string;
  company: CompanyReference;
  roles: Array<{ role: CompanyRoleSummary }>;
}

export const PERMISSIONS = {
  auditRead: "audit.read",
  billingManage: "billing.manage",
  billingRead: "billing.read",
  departmentManage: "department.manage",
  formCreate: "form.create",
  formManage: "form.manage",
  memberInvite: "member.invite",
  memberManage: "member.manage",
  memberRead: "member.read",
  reportRead: "report.read",
  requestCreate: "request.create",
  requestReadAll: "request.read_all",
  roleManage: "role.manage",
  roleRead: "role.read",
  taskPerform: "task.perform",
  workflowCreate: "workflow.create",
  workflowManage: "workflow.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
