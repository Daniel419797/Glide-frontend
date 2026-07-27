"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VisualWalkthrough } from "./sections/visual-walkthrough";
import { TestimonialsSection } from "./sections/testimonials-section";
import { PricingSection } from "./sections/pricing-section";
import { IntegrationsSection } from "./sections/integrations-section";
import { FAQSection } from "./sections/faq-section";
import {
  FileCheck2Icon,
  RouteIcon,
  ShieldCheckIcon,
  ZapIcon,
  EyeIcon,
  UsersIcon,
} from "lucide-react";

const features = [
  {
    icon: FileCheck2Icon,
    title: "No-Code Form Builder",
    description:
      "Design and deploy custom forms in minutes. Drag, drop, and configure without writing a single line of code.",
  },
  {
    icon: RouteIcon,
    title: "Visual Workflow Engine",
    description:
      "Map out approval chains with a visual editor. Route requests to the right people at the right time.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Complete Audit Trail",
    description:
      "Every action is logged and traceable. Meet compliance requirements without the overhead.",
  },
  {
    icon: ZapIcon,
    title: "Instant Notifications",
    description:
      "Alerts fire the moment a request needs attention. No more chasing emails or waiting on approvals.",
  },
  {
    icon: EyeIcon,
    title: "Real-Time Visibility",
    description:
      "See exactly where every request stands. Dashboards surface bottlenecks before they become blockers.",
  },
  {
    icon: UsersIcon,
    title: "Role-Based Access",
    description:
      "Granular permissions ensure the right people see the right forms and approve the right requests.",
  },
];

const steps = [
  {
    num: "1",
    title: "Create Your Form",
    description:
      "Build custom forms with our drag-and-drop editor. Add fields, set validation rules, and publish in minutes.",
  },
  {
    num: "2",
    title: "Define the Workflow",
    description:
      "Map out your approval chain. Set conditions, assign reviewers, and automate routing.",
  },
  {
    num: "3",
    title: "Track & Approve",
    description:
      "Monitor requests in real-time. Approve, reject, or redirect with full context and audit trails.",
  },
];

const stats = [
  { value: "10,000+", label: "Forms Created" },
  { value: "50,000+", label: "Approvals Processed" },
  { value: "99.9%", label: "Uptime" },
];

export function HeroContent() {
  return (
    <div className="relative z-10">
      <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">
          Glide
        </span>
        <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Connect Every Response
          <br />
          to the{" "}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
            Right Channel
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-700 dark:text-gray-300 sm:text-lg sm:leading-8">
          Glide turns messy approval chains into streamlined workflows. Submit a request, and it
          automatically routes through the right people — with full visibility at every step.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            render={<Link href="/register" />}
            className="h-12 px-8 text-base font-semibold"
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/login" />}
            className="h-12 border-gray-300 bg-white/60 px-8 text-base font-semibold text-gray-900 backdrop-blur-sm hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Sign In
          </Button>
        </div>
      </section>

      <section className="border-y border-gray-200/50 bg-white/[0.03] py-10 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Trusted by 500+ teams worldwide
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-gray-500 dark:text-gray-400">
            {["Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries"].map((name) => (
              <span key={name} className="text-base font-semibold tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why teams choose Glide
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Stop losing requests in email threads. Glide gives you structure, speed, and full
              accountability on every operational request.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-200/50 bg-white/60 p-7 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/30 dark:hover:shadow-blue-400/5"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/15 dark:bg-blue-400/10 dark:group-hover:bg-blue-400/15">
                  <f.icon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-black/[0.03] px-4 py-20 dark:bg-white/[0.03] sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Simple as 1-2-3
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              From first form to first approval in under five minutes.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-lg font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                  {s.num}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VisualWalkthrough />

      <TestimonialsSection />

      <PricingSection />

      <IntegrationsSection />

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by teams worldwide
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-300/10 dark:from-blue-400/5 dark:to-blue-300/5" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Ready to automate your approvals?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Join hundreds of teams already using Glide to streamline their operations.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              render={<Link href="/register" />}
              className="h-12 px-8 text-base font-semibold"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/login" />}
              className="h-12 border-gray-300 bg-white/60 px-8 text-base font-semibold text-gray-900 backdrop-blur-sm hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      <FAQSection />

      <footer className="border-t border-gray-200/50 px-4 py-8 dark:border-white/5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>&copy; 2026 Glide. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-gray-900 dark:hover:text-white">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-gray-900 dark:hover:text-white">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
