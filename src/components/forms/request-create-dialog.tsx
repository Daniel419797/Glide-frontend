"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest, createIdempotencyKey } from "@/lib/api-client";
import { humanize } from "@/lib/format";
import type { FormRecord, RequestRecord } from "@/types/backend";

type FieldSchema = {
  type?: string;
  title?: string;
  description?: string;
  format?: string;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  default?: unknown;
};

function FieldInput({
  name,
  schema,
  value,
  onChange,
}: {
  name: string;
  schema: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `field-${name}`;
  if (schema.type === "boolean")
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
        />
        <Label htmlFor={id}>{schema.title ?? humanize(name)}</Label>
      </div>
    );
  if (schema.enum)
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{schema.title ?? humanize(name)}</Label>
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Select an option</option>
          {schema.enum.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      </div>
    );
  if (schema.format === "textarea")
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{schema.title ?? humanize(name)}</Label>
        <Textarea
          id={id}
          value={String(value ?? "")}
          maxLength={schema.maxLength}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
        />
      </div>
    );
  const numeric = schema.type === "number" || schema.type === "integer";
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{schema.title ?? humanize(name)}</Label>
      <Input
        id={id}
        type={
          numeric
            ? "number"
            : schema.format === "date"
              ? "date"
              : schema.format === "email"
                ? "email"
                : "text"
        }
        value={String(value ?? "")}
        min={schema.minimum}
        max={schema.maximum}
        minLength={schema.minLength}
        maxLength={schema.maxLength}
        onChange={(event) =>
          onChange(
            numeric
              ? event.target.value === ""
                ? ""
                : Number(event.target.value)
              : event.target.value,
          )
        }
      />
      <p className="text-xs text-muted-foreground">{schema.description}</p>
    </div>
  );
}

export function RequestCreateDialog({ form }: { form: FormRecord }) {
  const [open, setOpen] = useState(false);
  const schema = form.schema as { properties?: Record<string, FieldSchema>; required?: string[] };
  const initial = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([key, field]) => [
          key,
          field.default ?? (field.type === "boolean" ? false : ""),
        ]),
      ),
    [schema.properties],
  );
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const { companyPath } = useCompany();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<RequestRecord>(companyPath("/requests"), {
        method: "POST",
        idempotencyKey: createIdempotencyKey("request"),
        body: JSON.stringify({
          formId: form.id,
          formData: values,
          clientRequestId: crypto.randomUUID(),
        }),
      }),
    onSuccess: (request) => {
      toast.success("Request submitted");
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
      window.location.assign(`/requests/${request.id}`);
    },
  });
  const required = new Set(schema.required ?? []);
  const valid = [...required].every(
    (key) => values[key] !== "" && values[key] !== null && values[key] !== undefined,
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Start request</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
          <DialogDescription>
            {form.description ?? "Complete the fields below to submit this request."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {Object.entries(schema.properties ?? {}).map(([name, field]) => (
            <div key={name}>
              <FieldInput
                name={name}
                schema={field}
                value={values[name]}
                onChange={(value) => setValues((current) => ({ ...current, [name]: value }))}
              />
              {required.has(name) && <span className="sr-only">Required</span>}
            </div>
          ))}
          {Object.keys(schema.properties ?? {}).length === 0 && (
            <p className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground">
              This form has no input fields. Submit to begin its workflow.
            </p>
          )}
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
