"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppLoadingScreen } from "@/components/shared/data-states";
import { useAuth } from "@/features/auth/auth-provider";

export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status !== "authenticated") return <AppLoadingScreen />;
  return children;
}
