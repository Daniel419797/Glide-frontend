"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { WorkflowStep } from "@/types/backend";

export type FormField = {
  id: string;
  label: string;
  description: string;
  type: "text" | "textarea" | "number" | "date" | "boolean";
  required: boolean;
};

const FIELD_TYPES = [
  ["text", "Short text"],
  ["textarea", "Long text"],
  ["number", "Number"],
  ["date", "Date"],
  ["boolean", "Yes or no"],
] as const;

export function schemaToFields(schema: Record<string, unknown>): FormField[] {
  const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  return Object.entries(properties).map(([id, field]) => ({
    id,
    label: String(field.title ?? id),
    description: String(field.description ?? ""),
    type:
      field.type === "boolean"
        ? "boolean"
        : field.type === "number" || field.type === "integer"
          ? "number"
          : field.format === "date"
            ? "date"
            : field.format === "textarea"
              ? "textarea"
              : "text",
    required: required.has(id),
  }));
}

export function fieldsToSchema(fields: FormField[]) {
  return {
    type: "object",
    required: fields.filter((field) => field.required).map((field) => field.id),
    properties: Object.fromEntries(
      fields.map((field) => [
        field.id,
        {
          type:
            field.type === "number" ? "number" : field.type === "boolean" ? "boolean" : "string",
          title: field.label,
          ...(field.description ? { description: field.description } : {}),
          ...(field.type === "date" || field.type === "textarea" ? { format: field.type } : {}),
        },
      ]),
    ),
    additionalProperties: false,
  };
}

function fieldId(label: string, existing: FormField[]) {
  const base =
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "question";
  let id = base;
  let suffix = 2;
  while (existing.some((field) => field.id === id)) id = `${base}_${suffix++}`;
  return id;
}

export function FormQuestionBuilder({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  const update = (index: number, patch: Partial<FormField>) =>
    onChange(fields.map((field, current) => (current === index ? { ...field, ...patch } : field)));
  const add = () =>
    onChange([
      ...fields,
      {
        id: fieldId("Question", fields),
        label: "",
        description: "",
        type: "text",
        required: false,
      },
    ]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Form questions</h2>
          <p className="text-sm text-muted-foreground">Information requesters must provide.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <PlusIcon /> Add question
        </Button>
      </div>
      {fields.length === 0 && (
        <div className="border-y py-8 text-center text-sm text-muted-foreground">
          No questions yet. Add the first question requesters should answer.
        </div>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_180px]">
              <div className="space-y-1.5">
                <Label htmlFor={`label-${field.id}`}>Question</Label>
                <Input
                  id={`label-${field.id}`}
                  value={field.label}
                  placeholder="e.g. Reason for request"
                  onChange={(event) => update(index, { label: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`type-${field.id}`}>Answer type</Label>
                <select
                  id={`type-${field.id}`}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={field.type}
                  onChange={(event) =>
                    update(index, { type: event.target.value as FormField["type"] })
                  }
                >
                  {FIELD_TYPES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove question"
              title="Remove question"
              onClick={() => onChange(fields.filter((_, current) => current !== index))}
            >
              <Trash2Icon />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`help-${field.id}`}>
              Help text <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id={`help-${field.id}`}
              value={field.description}
              placeholder="Add guidance for the requester"
              onChange={(event) => update(index, { description: event.target.value })}
            />
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <Label htmlFor={`required-${field.id}`}>Required answer</Label>
            <Switch
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(required) => update(index, { required })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const APPROVERS = [
  ["REQUESTER_MANAGER", "Requester's manager"],
  ["DEPARTMENT_MANAGER", "Department manager"],
] as const;
const MODES = [
  ["ANY", "Any one approver"],
  ["ALL", "All approvers"],
  ["SEQUENTIAL", "In listed order"],
] as const;

export function WorkflowBuilder({
  steps,
  onChange,
}: {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
}) {
  const normalized = (next: WorkflowStep[]) =>
    next.map((step, index) => ({ ...step, order: index + 1 }));
  const update = (index: number, patch: Partial<WorkflowStep>) =>
    onChange(
      normalized(steps.map((step, current) => (current === index ? { ...step, ...patch } : step))),
    );
  const move = (index: number, offset: number) => {
    const next = [...steps];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(normalized(next));
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Approval workflow</h2>
          <p className="text-sm text-muted-foreground">Who reviews a request, in order.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange(
              normalized([
                ...steps,
                {
                  order: steps.length + 1,
                  name: "Approval",
                  assignmentMode: "ANY",
                  targets: [{ type: "REQUESTER_MANAGER" }],
                },
              ]),
            )
          }
        >
          <PlusIcon /> Add step
        </Button>
      </div>
      {steps.map((step, index) => (
        <div key={`${step.order}-${index}`} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {index + 1}
            </span>
            <Input
              aria-label={`Step ${index + 1} name`}
              value={step.name}
              onChange={(event) => update(index, { name: event.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Move step up"
              title="Move step up"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUpIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Move step down"
              title="Move step down"
              disabled={index === steps.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDownIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove step"
              title="Remove step"
              disabled={steps.length === 1}
              onClick={() => onChange(normalized(steps.filter((_, current) => current !== index)))}
            >
              <Trash2Icon />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`approver-${index}`}>Approver</Label>
              <select
                id={`approver-${index}`}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={step.targets[0]?.type ?? "REQUESTER_MANAGER"}
                onChange={(event) =>
                  update(index, {
                    targets: [
                      { type: event.target.value as "REQUESTER_MANAGER" | "DEPARTMENT_MANAGER" },
                    ],
                  })
                }
              >
                {APPROVERS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`mode-${index}`}>Step completes when</Label>
              <select
                id={`mode-${index}`}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={step.assignmentMode}
                onChange={(event) =>
                  update(index, {
                    assignmentMode: event.target.value as WorkflowStep["assignmentMode"],
                  })
                }
              >
                {MODES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
