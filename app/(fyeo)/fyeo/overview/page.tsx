import Link from "next/link";

const sections = [
  {
    href: "/fyeo/overview/getting-started",
    title: "Getting started",
    description: "Step-by-step guide to adding fyeo to your Next.js app: copy files, install dependencies, configure env, and wire up your root layout.",
  },
  {
    href: "/fyeo/overview/creating-and-using-flags",
    title: "Creating and using flags",
    description: "How to create flags in the dashboard and use them in your code — server, client, and per-environment behavior.",
  },
  {
    href: "/fyeo/overview/environments",
    title: "How environments work",
    description: "Use different flag states per stage (e.g. development, staging, production) and control rollouts and targeting.",
  },
  {
    href: "/fyeo/overview/code-examples",
    title: "Code examples",
    description: "Copy-pastable snippets for server components, client components, middleware, and optional config.",
  },
];

export default function OverviewPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Overview
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Get started with fyeo: create flags, configure environments, and
          use feature flags in your Next.js app. Choose a section below to dive in.
        </p>
      </div>

      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Overview sections">
        {sections.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group block rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.99]"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
            <span className="mt-3 inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>
              Read more →
            </span>
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-200 dark:border-white/10">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View the <Link href="/fyeo/audit" className="text-indigo-600 dark:text-indigo-400 hover:underline">Audit log</Link> to see who changed which flags and when.
        </p>
      </div>
    </div>
  );
}
