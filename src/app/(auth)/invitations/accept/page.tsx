"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthSuccess } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { apiRequest } from "@/lib/api-client";

function InvitationContent() {
  const token = useSearchParams().get("token");
  const { status } = useAuth();
  const [result, setResult] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (status !== "authenticated" || !token || result !== "idle") return;
    void apiRequest("/companies/invitations/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => setResult("success"))
      .catch((error: Error) => {
        setMessage(error.message);
        setResult("error");
      });
  }, [result, status, token]);
  if (!token)
    return (
      <AuthSuccess
        title="Invalid invitation"
        description="This invitation link does not contain a token."
      >
        <Button render={<Link href="/login" />}>Return to sign in</Button>
      </AuthSuccess>
    );
  if (
    status === "loading" ||
    result === "loading" ||
    (status === "authenticated" && result === "idle")
  )
    return <p className="text-center text-sm text-muted-foreground">Accepting invitation...</p>;
  if (status === "unauthenticated")
    return (
      <AuthSuccess
        title="Sign in to accept"
        description="Use the email address that received this invitation."
      >
        <Button
          render={
            <Link
              href={`/login?next=${encodeURIComponent(`/invitations/accept?token=${token}`)}`}
            />
          }
        >
          Sign in
        </Button>
      </AuthSuccess>
    );
  if (result === "success")
    return (
      <AuthSuccess
        title="Invitation accepted"
        description="The company workspace is now available in Glide."
      >
        <Button render={<Link href="/dashboard" />}>Open workspace</Button>
      </AuthSuccess>
    );
  return (
    <AuthSuccess
      title="Invitation could not be accepted"
      description={message || "The invitation may be expired or belong to another account."}
    >
      <Button render={<Link href="/dashboard" />}>Return to Glide</Button>
    </AuthSuccess>
  );
}

export default function InvitationPage() {
  return (
    <Suspense
      fallback={<p className="text-center text-sm text-muted-foreground">Loading invitation...</p>}
    >
      <InvitationContent />
    </Suspense>
  );
}
