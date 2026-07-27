import { FormInputIcon, GitBranchIcon, CheckCircleIcon, BarChart3Icon } from "lucide-react";

const steps = [
  {
    num: "1",
    icon: FormInputIcon,
    title: "Design Your Form",
    description: "Drag and drop fields, set validation rules, and publish in minutes — no code required.",
  },
  {
    num: "2",
    icon: GitBranchIcon,
    title: "Set Up Workflow",
    description: "Map approval chains visually. Route requests to the right people at the right time.",
  },
  {
    num: "3",
    icon: CheckCircleIcon,
    title: "Review & Approve",
    description: "Monitor requests in real-time. Approve, reject, or redirect with full context.",
  },
  {
    num: "4",
    icon: BarChart3Icon,
    title: "Track Everything",
    description: "Dashboards surface bottlenecks before they become blockers. Full audit trail included.",
  },
];

export function VisualWalkthrough() {
  return (
    <section id="walkthrough" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            From first form to first approval
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            See how Glide transforms your approval process in four simple steps.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="group relative">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/15 dark:bg-blue-400/10 dark:text-blue-400 dark:group-hover:bg-blue-400/15">
                <s.icon className="size-6" />
              </div>
              <div className="absolute -left-3 -top-3 text-5xl font-bold text-blue-500/10 dark:text-blue-400/10">
                {s.num}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {s.description}
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200/50 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-3/4 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="h-2 w-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded-full bg-gray-200/60 dark:bg-white/5" />
                  <div className="h-2 w-5/6 rounded-full bg-gray-200/60 dark:bg-white/5" />
                  <div className="h-2 w-4/6 rounded-full bg-gray-200/60 dark:bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
