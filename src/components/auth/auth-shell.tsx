import Link from "next/link";
import { CheckCircle2Icon, FileCheck2Icon, RouteIcon, ShieldCheckIcon } from "lucide-react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(380px,0.9fr)_minmax(520px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        <Link href="/" className="text-[28px] font-semibold tracking-[-0.04em]">
          Glide
        </Link>
        <div className="my-auto max-w-lg">
          <h1 className="text-[38px] font-semibold leading-[1.16] tracking-[-0.035em]">
            Every request has a clear path forward.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-sidebar-foreground/68">
            Submit, approve, assign, and complete operational work with accountable ownership at
            every step.
          </p>
          <div className="mt-12 grid gap-5">
            {[
              [
                FileCheck2Icon,
                "Standardized requests",
                "Forms stay consistent across every department.",
              ],
              [
                RouteIcon,
                "Visible workflow",
                "Everyone sees the current step and responsible owner.",
              ],
              [
                ShieldCheckIcon,
                "Auditable decisions",
                "Approvals, corrections, and overrides remain traceable.",
              ],
            ].map(([Icon, title, description]) => (
              <div key={String(title)} className="flex gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/6">
                  <Icon className="size-[18px] text-[#70c8cc]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{String(title)}</p>
                  <p className="mt-1 text-xs leading-5 text-sidebar-foreground/60">
                    {String(description)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/45">Secure internal workflow management</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}

export function AuthSuccess({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2Icon />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.025em]">{title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {children ? <div className="mt-7">{children}</div> : null}
    </div>
  );
}
