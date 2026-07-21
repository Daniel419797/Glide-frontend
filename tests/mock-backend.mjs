import http from "node:http";

const companyId = "11111111-1111-4111-8111-111111111111";
const membershipId = "22222222-2222-4222-8222-222222222222";
const now = new Date().toISOString();
const profile = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "amara@northstar.test",
  fullName: "Amara Okafor",
  platformRole: null,
  emailVerifiedAt: now,
  isActive: true,
  memberships: [
    {
      id: membershipId,
      company: { id: companyId, name: "Northstar Services", slug: "northstar", status: "ACTIVE" },
    },
  ],
  createdAt: now,
  updatedAt: now,
};
const role = {
  id: "44444444-4444-4444-8444-444444444444",
  name: "Company Admin",
  systemKey: "COMPANY_ADMIN",
  permissions: [
    "member.read",
    "member.invite",
    "member.manage",
    "department.manage",
    "form.create",
    "form.manage",
    "workflow.create",
    "workflow.manage",
    "request.create",
    "request.read_all",
    "task.perform",
    "report.read",
    "audit.read",
    "billing.read",
    "billing.manage",
  ].map((key) => ({ permission: { key } })),
};
const forms = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    companyId,
    name: "Purchase Request",
    description: "Request authorization to purchase goods or services.",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        item: { type: "string", title: "Item", minLength: 2 },
        amount: { type: "number", title: "Amount", minimum: 1 },
      },
      required: ["item", "amount"],
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
    _count: { requests: 2, workflowTemplates: 1 },
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    companyId,
    name: "Leave Request",
    description: "Submit planned leave for approval.",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: { startDate: { type: "string", format: "date", title: "Start date" } },
      required: ["startDate"],
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
    _count: { requests: 1, workflowTemplates: 1 },
  },
];
const requests = [
  {
    id: "77777777-7777-4777-8777-777777777777",
    companyId,
    formId: forms[0].id,
    workflowTemplateId: "88888888-8888-4888-8888-888888888888",
    initiatedByMembershipId: membershipId,
    departmentId: null,
    formData: { item: "Office chairs", amount: 2400 },
    status: "IN_REVIEW",
    currentStepOrder: 1,
    form: { id: forms[0].id, name: forms[0].name },
    initiatedBy: {
      id: membershipId,
      user: { id: profile.id, fullName: profile.fullName, email: profile.email },
    },
    tasks: [
      {
        id: "99999999-9999-4999-8999-999999999999",
        status: "PENDING",
        sequence: null,
        createdAt: now,
        completedAt: null,
        workflowStep: {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          order: 1,
          name: "Manager approval",
          assignmentMode: "ANY",
          quorum: null,
        },
        assignees: [
          {
            membershipId,
            sequence: null,
            actedAt: null,
            membership: {
              id: membershipId,
              user: { id: profile.id, fullName: profile.fullName, email: profile.email },
            },
          },
        ],
        actions: [],
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

function envelope(data, pagination) {
  return { success: true, data, ...(pagination ? { pagination } : {}) };
}
function send(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json",
    "x-request-id": "mock-request",
  });
  response.end(JSON.stringify(payload));
}
async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
function page(items) {
  return envelope(items, { page: 1, pageSize: 100, total: items.length, totalPages: 1 });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:4100");
  const path = url.pathname.replace(/^\/api\/v1/, "");
  if (path === "/auth/login" && request.method === "POST")
    return send(
      response,
      200,
      envelope({ accessToken: "access-login", refreshToken: "refresh-login", profile }),
    );
  if (path === "/auth/refresh" && request.method === "POST")
    return send(
      response,
      200,
      envelope({ accessToken: "access-refresh", refreshToken: "refresh-rotated" }),
    );
  if (path === "/auth/logout" && request.method === "POST")
    return send(response, 200, envelope({ message: "Logged out" }));
  if (path === "/auth/profile") return send(response, 200, envelope(profile));
  if (path === "/companies")
    return send(
      response,
      200,
      envelope([
        {
          id: membershipId,
          company: { ...profile.memberships[0].company, ownerMembershipId: membershipId },
          roles: [{ role }],
        },
      ]),
    );
  const base = `/companies/${companyId}`;
  if (path === `${base}/reports/me`)
    return send(
      response,
      200,
      envelope({
        submitted: requests.length,
        pendingTasks: 1,
        actions: { APPROVED: 3 },
        recentRequests: requests.map(({ id, status, createdAt, updatedAt, form }) => ({
          id,
          status,
          createdAt,
          updatedAt,
          form,
        })),
      }),
    );
  if (path === `${base}/forms` && request.method === "GET") return send(response, 200, page(forms));
  if (path === `${base}/requests` && request.method === "GET")
    return send(
      response,
      200,
      page(
        requests.map((item) => ({
          id: item.id,
          formId: item.formId,
          form: item.form,
          status: item.status,
          currentStepOrder: item.currentStepOrder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          _count: { tasks: item.tasks.length },
        })),
      ),
    );
  if (path === `${base}/requests` && request.method === "POST") {
    const body = await readJson(request);
    const created = {
      ...requests[0],
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      formId: body.formId,
      formData: body.formData,
      status: "PENDING",
    };
    requests.unshift(created);
    return send(response, 201, envelope(created));
  }
  if (path === `${base}/requests/${requests[0].id}` && request.method === "GET")
    return send(response, 200, envelope(requests[0]));
  if (
    path === `${base}/requests/tasks/${requests[0].tasks[0].id}/actions` &&
    request.method === "POST"
  ) {
    const body = await readJson(request);
    requests[0].tasks[0].actions.push({
      id: crypto.randomUUID(),
      membershipId,
      action: body.action,
      comments: body.comments ?? null,
      createdAt: now,
      membership: { id: membershipId, user: { fullName: profile.fullName } },
    });
    requests[0].tasks[0].status = "COMPLETED";
    requests[0].status = "APPROVED";
    return send(response, 200, envelope(requests[0]));
  }
  return send(response, 404, {
    success: false,
    error: { code: "NOT_FOUND", message: `No mock route for ${path}` },
  });
});

server.listen(4100, "127.0.0.1", () => console.log("Mock backend listening on 4100"));
