"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest } from "@/lib/api-client";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Reset link required</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Open the secure link from your password reset email, or request a new one.
        </p>
        <Button className="mt-7" render={<Link href="/forgot-password" />}>
          Request new link
        </Button>
      </>
    );
  }
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your other active sessions will be revoked after this change.
      </p>
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          void apiRequest("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, password }),
          })
            .then(() => {
              toast.success("Password reset. Sign in with your new password.");
              router.replace("/login");
            })
            .catch((error) =>
              toast.error(error instanceof Error ? error.message : "Password could not be reset."),
            )
            .finally(() => setPending(false));
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <FieldDescription>
              Use at least 10 characters and avoid a previously used password.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            disabled={pending || password.length < 10 || password !== confirmation}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null} Reset password
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-muted" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
