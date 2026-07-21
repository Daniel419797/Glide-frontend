import { AppShell } from "@/components/app-shell/app-shell";
import { ProtectedApp } from "@/features/auth/protected-app";

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedApp>
      <AppShell>{children}</AppShell>
    </ProtectedApp>
  );
}
