"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthSuccess } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [state, setState] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle",
  );
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!token) return;
    let active = true;
    void apiRequest("/auth/verify-email", {
      method: "POST",
      skipAuthRefresh: true,
      body: JSON.stringify({ token }),
    })
      .then(() => {
        if (active) setState("success");
      })
      .catch((error: Error) => {
        if (active) {
          setMessage(error.message);
          setState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [token]);
  if (state === "verifying")
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Verifying your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">This should take only a moment.</p>
      </div>
    );
  if (state === "success")
    return (
      <AuthSuccess
        title="Email verified"
        description="Your account is ready. Sign in to join or create a company workspace."
      >
        <Button render={<Link href="/login" />}>Continue to sign in</Button>
      </AuthSuccess>
    );
  return (
    <div>
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Open the verification link sent to your work email. You can request a new link below.
      </p>
      {state === "error" && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      )}
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          void apiRequest("/auth/resend-verification", {
            method: "POST",
            skipAuthRefresh: true,
            body: JSON.stringify({ email }),
          })
            .then(() => setMessage("If verification is required, a new email has been sent."))
            .catch((error: Error) => setMessage(error.message));
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="verification-email">Email</Label>
          <Input
            id="verification-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button className="w-full" type="submit">
          Resend verification
        </Button>
      </form>
      <Button className="mt-3 w-full" variant="ghost" render={<Link href="/login" />}>
        Return to sign in
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm text-muted-foreground">Loading verification...</p>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
