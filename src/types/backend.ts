import type { Pagination } from "@/types/api";

export type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED"
  | "CANCELLED";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "CANCELLED";
export type TaskAction = "APPROVED" | "REJECTED" | "COMPLETED" | "REASSIGNED" | "COMMENTED";

export interface FormRecord {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  schema: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workflowTemplates?: WorkflowTemplate[];
  _count?: { requests: number; workflowTemplates: number };
}

export interface WorkflowTarget {
  id?: string;
  type:
    | "MEMBER"
    | "ROLE"
    | "DEPARTMENT"
    | "DEPARTMENT_MANAGER"
    | "TEAM"
    | "POSITION"
    | "REQUESTER_MANAGER"
    | "FORM_FIELD";
  targetId?: string | null;
  fieldPath?: string | null;
  order?: number;
}

export interface WorkflowStep {
  id?: string;
  order: number;
  name: string;
  assignmentMode: "ANY" | "ALL" | "QUORUM" | "SEQUENTIAL";
  quorum?: number | null;
  rules?: Array<{ expression: Record<string, unknown> }>;
  targets: WorkflowTarget[];
}

export interface WorkflowTemplate {
  id: string;
  version: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  steps: WorkflowStep[];
}

export interface RequestListItem {
  id: string;
  formId: string;
  form: { id: string; name: string };
  status: RequestStatus;
  currentStepOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
}

export interface RequestTask {
  id: string;
  status: TaskStatus;
  sequence: number | null;
  createdAt: string;
  completedAt: string | null;
  workflowStep: {
    id: string;
    order: number;
    name: string;
    assignmentMode: string;
    quorum: number | null;
  };
  assignees: Array<{
    membershipId: string;
    sequence: number | null;
    actedAt: string | null;
    membership: { id: string; user: { id: string; fullName: string; email: string } };
  }>;
  actions: Array<{
    id: string;
    membershipId: string;
    action: TaskAction;
    comments: string | null;
    createdAt: string;
    membership: { id: string; user: { fullName: string } };
  }>;
}

export interface RequestRecord extends Omit<RequestListItem, "_count"> {
  companyId: string;
  workflowTemplateId: string;
  initiatedByMembershipId: string;
  departmentId: string | null;
  formData: Record<string, unknown>;
  initiatedBy: { id: string; user: { id: string; fullName: string; email: string } };
  tasks: RequestTask[];
}

export interface PersonalReport {
  submitted: number;
  pendingTasks: number;
  actions: Partial<Record<TaskAction, number>>;
  recentRequests: Array<{
    id: string;
    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
    form: { name: string };
  }>;
}

export interface CompanyMetrics {
  totalRequests: number;
  openTasks: number;
  averageResolutionHours: number;
  byStatus: Partial<Record<RequestStatus, number>>;
  byForm: Array<{ formId: string; name: string; count: number }>;
  byDepartment: Array<{ departmentId: string | null; name: string; count: number }>;
}

export interface MemberRecord {
  id: string;
  status: "ACTIVE" | "SUSPENDED" | "LEFT";
  createdAt: string;
  user: { id: string; email: string; fullName: string };
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
  manager: { id: string; user: { fullName: string } } | null;
  roles: Array<{ role: { id: string; name: string; systemKey: string | null } }>;
}

export interface RoleRecord {
  id: string;
  name: string;
  systemKey: string | null;
  isProtected: boolean;
  permissions: Array<{ permission: { key: string; description: string } }>;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  createdAt?: string;
  managerMembershipId?: string | null;
  manager?: { id: string; user: { fullName: string; email: string } } | null;
  members?: Array<{ membershipId: string }>;
  _count?: { members: number };
}

export interface AuditRecord {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  membership: { id: string; user: { fullName: string; email: string } } | null;
}

export interface PagedResult<T> {
  items: T[];
  pagination?: Pagination;
}
