import {
  HashIcon,
  MessageSquareIcon,
  MailIcon,
  CloudIcon,
  WebhookIcon,
  PlugIcon,
  FolderIcon,
  GlobeIcon,
} from "lucide-react";

const integrations = [
  { name: "Slack", icon: HashIcon },
  { name: "Microsoft Teams", icon: MessageSquareIcon },
  { name: "Google Workspace", icon: CloudIcon },
  { name: "Salesforce", icon: GlobeIcon },
  { name: "HubSpot", icon: FolderIcon },
  { name: "Zapier", icon: PlugIcon },
  { name: "Jira", icon: WebhookIcon },
  { name: "Email (SMTP)", icon: MailIcon },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="border-y border-gray-200/50 bg-white/[0.03] px-4 py-20 dark:border-white/5 dark:bg-white/[0.02] sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Connects with your stack
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Glide integrates with the tools your team already uses. No rip-and-replace required.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {integrations.map((i) => (
            <div
              key={i.name}
              className="group flex items-center gap-3 rounded-xl border border-gray-200/50 bg-white/60 px-5 py-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/30 dark:hover:shadow-blue-400/5"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/15 dark:bg-blue-400/10 dark:group-hover:bg-blue-400/15">
                <i.icon className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{i.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
