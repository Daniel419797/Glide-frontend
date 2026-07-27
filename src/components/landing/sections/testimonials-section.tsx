import { QuoteIcon } from "lucide-react";

const testimonials = [
  {
    quote: "Glide cut our approval cycle from 5 days to 4 hours. The visibility alone is worth the switch.",
    name: "Sarah Chen",
    role: "Head of Operations",
    company: "Acme Corp",
  },
  {
    quote: "We replaced three separate tools with Glide. One platform for forms, workflows, and compliance tracking.",
    name: "Marcus Rivera",
    role: "VP of Engineering",
    company: "Globex",
  },
  {
    quote: "The audit trail gave our compliance team confidence from day one. No more chasing email threads.",
    name: "Emily Nakamura",
    role: "Compliance Director",
    company: "Initech",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by teams worldwide
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            See what our customers have to say about streamlining their operations with Glide.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-gray-200/50 bg-white/60 p-7 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/30 dark:hover:shadow-blue-400/5"
            >
              <QuoteIcon className="size-5 text-blue-500/40 dark:text-blue-400/40" />
              <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
