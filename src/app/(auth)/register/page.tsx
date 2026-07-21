"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("/auth/register", {
        method: "POST",
        skipAuthRefresh: true,
        body: JSON.stringify({ fullName, email, password }),
      }),
    onSuccess: () => router.push(`/verify-email?email=${encodeURIComponent(email)}`),
  });
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use your work email to join or create a company workspace.
        </p>
      </div>
      <form
        className="mt-7 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            autoComplete="name"
            value={fullName}
            required
            minLength={2}
            maxLength={120}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Work email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            required
            maxLength={254}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            required
            minLength={12}
            maxLength={72}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Use at least 12 characters. Passwords are limited to 72 characters.
          </p>
        </div>
        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
