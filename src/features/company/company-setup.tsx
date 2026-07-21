"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2Icon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { PlatformConsole } from "@/features/platform/platform-console";
import { apiRequest } from "@/lib/api-client";

export function CompanySetup() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("/companies", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), slug: slug.trim().toLowerCase() }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company workspace created");
    },
  });
  if (user?.platformRole) return <PlatformConsole />;
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-5">
      <section
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm"
        aria-labelledby="company-setup-title"
      >
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2Icon className="size-5" />
        </div>
        <h1 id="company-setup-title" className="mt-5 text-2xl font-semibold">
          Create your company workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your forms, members, approvals, and billing remain isolated inside this workspace.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              value={name}
              maxLength={120}
              required
              autoComplete="organization"
              onChange={(event) => {
                setName(event.target.value);
                if (!slug)
                  setSlug(
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-slug">Workspace URL key</Label>
            <Input
              id="company-slug"
              value={slug}
              minLength={3}
              maxLength={60}
              pattern="[a-z0-9-]+"
              required
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) =>
                setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
            />
          </div>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}
          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating workspace..." : "Create workspace"}
          </Button>
        </form>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => void logout()}>
          <LogOutIcon data-icon="inline-start" /> Sign out
        </Button>
      </section>
    </main>
  );
}
