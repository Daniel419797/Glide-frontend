"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid company email."),
  password: z.string().min(1, "Enter your password."),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [pending, setPending] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: LoginValues) {
    setPending(true);
    try {
      await login(values);
      router.replace(searchParams.get("next") || "/dashboard");
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED")
        router.push("/verify-email");
      else if (error instanceof ApiError && error.code === "ACCOUNT_PENDING")
        router.push("/pending-approval");
      else toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="lg:hidden">
        <span className="text-2xl font-semibold tracking-[-0.04em]">Glide</span>
      </div>
      <h1 className="mt-10 text-[28px] font-semibold tracking-[-0.03em] lg:mt-0">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with your approved company account.
      </p>
      <form className="mt-8" onSubmit={form.handleSubmit(submit)} noValidate>
        <FieldGroup>
          <Field data-invalid={Boolean(form.formState.errors.email)}>
            <FieldLabel htmlFor="email">Company email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.password)}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>
          <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
            {pending ? <Spinner data-icon="inline-start" /> : null} Sign in
          </Button>
        </FieldGroup>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        New to Glide?{" "}
        <Link className="font-medium text-primary hover:underline" href="/register">
          Request access
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-muted" />}>
      <LoginForm />
    </Suspense>
  );
}
