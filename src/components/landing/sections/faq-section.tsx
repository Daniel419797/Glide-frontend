"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

const faqs = [
  {
    q: "How long does it take to set up Glide?",
    a: "Most teams are up and running in under 5 minutes. Create a form, define your approval workflow, and start collecting submissions — no engineering required.",
  },
  {
    q: "Can I migrate from my current tool?",
    a: "Yes. Glide supports importing forms and workflows from popular tools. Our team can help with bulk migrations for Enterprise customers.",
  },
  {
    q: "Is my data secure?",
    a: "Glide uses AES-256 encryption at rest and TLS 1.3 in transit. We're SOC 2 Type II compliant and offer HIPAA-ready plans for healthcare teams.",
  },
  {
    q: "What integrations do you support?",
    a: "Glide connects with Slack, Microsoft Teams, Google Workspace, Salesforce, HubSpot, Zapier, Jira, and any system that supports webhooks or SMTP.",
  },
  {
    q: "Can I customize the approval workflow?",
    a: "Absolutely. Define multi-step approval chains, conditional routing, escalation rules, and deadline-based automations — all through a visual drag-and-drop editor.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about getting started with Glide.
          </p>
        </div>
        <div className="mt-14 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{f.q}</span>
                  <ChevronDownIcon
                    className={`size-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4">
                    <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
