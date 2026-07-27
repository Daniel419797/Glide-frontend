import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for small teams getting started with workflow automation.",
    features: ["5 forms", "100 submissions/mo", "Basic workflows", "Email notifications", "1 team member"],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For growing teams that need advanced workflows and unlimited scale.",
    features: ["Unlimited forms", "Unlimited submissions", "Advanced workflows", "Priority support", "Up to 25 members", "Custom branding"],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with advanced compliance and security requirements.",
    features: ["Everything in Pro", "SSO & SAML", "Custom integrations", "Dedicated support", "Unlimited members", "SLA guarantee"],
    cta: "Contact Sales",
    href: "#cta",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Start free, upgrade when you need to. No hidden fees.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                p.highlighted
                  ? "border-blue-500/50 bg-white/80 shadow-lg shadow-blue-500/10 dark:border-blue-400/50 dark:bg-white/10 dark:shadow-blue-400/10"
                  : "border-gray-200/50 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white dark:bg-blue-400">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{p.price}</span>
                {p.period && <span className="text-sm text-gray-500 dark:text-gray-400">{p.period}</span>}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{p.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckIcon className="size-4 shrink-0 text-blue-500 dark:text-blue-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                variant={p.highlighted ? undefined : "outline"}
                render={<Link href={p.href} />}
                className={`mt-6 h-12 w-full text-base font-semibold ${
                  p.highlighted
                    ? ""
                    : "border-gray-300 bg-white/60 text-gray-900 backdrop-blur-sm hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                }`}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
