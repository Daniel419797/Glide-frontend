"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your company email. If it matches an active account, we&apos;ll send reset
        instructions.
      </p>
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          void apiRequest("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
          })
            .then(() => toast.success("Check your email for reset instructions."))
            .catch((error) =>
              toast.error(error instanceof Error ? error.message : "Unable to request a reset."),
            );
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Company email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="lg">
            Send reset instructions
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}
