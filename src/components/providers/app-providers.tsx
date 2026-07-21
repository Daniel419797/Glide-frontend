"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/auth-provider";
import { CompanyProvider } from "@/features/company/company-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (
                error instanceof Error &&
                "status" in error &&
                (error as { status: number }).status < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompanyProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </CompanyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
