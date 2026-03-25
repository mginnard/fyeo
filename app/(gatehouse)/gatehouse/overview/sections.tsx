import Link from "next/link";

function CodeBlock({
  children,
  lang = "text",
}: {
  children: string;
  lang?: string;
}) {
  return (
    <div className="relative mt-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-gray-200 dark:border-white/10 text-xs font-medium text-gray-500 dark:text-gray-400">
        {lang}
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function GettingStartedSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Getting started
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Add Gatehouse to your existing Next.js app in a few steps.
      </p>

      <div className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
        <p className="font-medium text-gray-900 dark:text-white">Prerequisites</p>
        <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
          <li>Node.js 18+</li>
          <li>Next.js 14+ App Router project</li>
          <li>Tailwind CSS (the Gatehouse dashboard UI uses Tailwind)</li>
        </ul>
      </div>

      <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 text-sm">
        <li>
          <strong className="text-gray-900 dark:text-white">Get the Gatehouse code</strong> — Clone or download the Gatehouse repository. You will copy three pieces from it into your app.
        </li>
        <li>
          <strong className="text-gray-900 dark:text-white">Copy Gatehouse into your project</strong> — Copy the following from the Gatehouse repo into your app (keep the same paths):
          <ul className="mt-2 list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
            <li><code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">lib/gatehouse/</code> → your project&apos;s <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">lib/gatehouse/</code></li>
            <li><code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">app/(gatehouse)/gatehouse/</code> → your project&apos;s <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">app/(gatehouse)/gatehouse/</code></li>
            <li><code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">app/api/gatehouse/</code> → your project&apos;s <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">app/api/gatehouse/</code></li>
          </ul>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Ensure your <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">tsconfig.json</code> has <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">&quot;paths&quot;: {"{ "}&quot;@/*&quot;: [&quot;./*&quot;]{"}"}</code> so <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">@/lib/gatehouse</code> and the layout imports resolve.</p>
        </li>
        <li>
          <strong className="text-gray-900 dark:text-white">Install dependencies</strong> — Gatehouse needs <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">better-sqlite3</code>, <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">framer-motion</code>, and <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">@types/better-sqlite3</code>. In your project run:
          <CodeBlock lang="bash">
{`npm install better-sqlite3 framer-motion && npm install -D @types/better-sqlite3`}
          </CodeBlock>
        </li>
        <li>
          <strong className="text-gray-900 dark:text-white">Configure environment</strong> — Copy <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">.env.example</code> from Gatehouse into your project as <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">.env.local</code>, or create <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">.env.local</code> and set:
          <ul className="mt-2 list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
            <li><code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GATEHOUSE_SECRET=your-secret-here</code> (required for protecting the admin API)</li>
            <li>Optionally <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GATEHOUSE_ENV=development</code> (default is <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">development</code>)</li>
          </ul>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The database is created at <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">.gatehouse/flags.db</code> on first use.</p>
        </li>
        <li>
          <strong className="text-gray-900 dark:text-white">Wire up your root layout</strong> — In your app&apos;s root layout (e.g. <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">app/layout.tsx</code>), fetch flags with <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">getAllFlags()</code>, wrap the app with <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">ThemeProvider</code> and <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GatehouseProvider</code>, and render the Gatehouse <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">Sidebar</code> plus main content so the dashboard is available at <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">/gatehouse</code>. You can keep your existing <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">&lt;html&gt;</code>, fonts, and metadata; adjust the body as below.
          <CodeBlock lang="tsx">
{`import { getAllFlags } from "@/lib/gatehouse/sdk";
import { GatehouseProvider } from "@/lib/gatehouse/client";
import { ThemeProvider } from "./(gatehouse)/gatehouse/ThemeProvider";
import { Sidebar } from "./(gatehouse)/gatehouse/components/Sidebar";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let flags: Record<string, unknown>;
  try {
    flags = getAllFlags();
  } catch {
    flags = {};
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: \`(function(){var t=localStorage.getItem('gatehouse-theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');})();\`,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <GatehouseProvider flags={flags}>
            <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
              <Sidebar />
              <main className="flex-1 min-h-0 overflow-auto">{children}</main>
            </div>
          </GatehouseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}`}
          </CodeBlock>
        </li>
        <li>
          <strong className="text-gray-900 dark:text-white">Run and open the dashboard</strong> — Run <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">npm run dev</code> and open <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">http://localhost:3000/gatehouse/overview</code> (or <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">/gatehouse</code>) to confirm the UI loads.
        </li>
        <li>
          <strong className="text-gray-900 dark:text-white">Create your first flag</strong> — Go to <Link href="/gatehouse" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Flags</Link>, click Create, and add a key (e.g. <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">my-first-flag</code>) and name. Use it in code with <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">getFlag(&quot;my-first-flag&quot;)</code> or <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">useFlag(&quot;my-first-flag&quot;)</code> as in the Code examples below.
        </li>
      </ol>
    </section>
  );
}

export function CreatingAndUsingFlagsSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Creating and using flags
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Create flags from the <Link href="/gatehouse" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Flags</Link> page:
        choose a <strong>key</strong> (e.g. <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">new-checkout</code>), a name, and optionally a description and type (boolean, string, number, json).
        Each flag can be toggled on/off and configured separately per environment (see Environments below).
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        In your app you evaluate flags by key and optional user context. Gatehouse uses the current <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GATEHOUSE_ENV</code> to pick the right environment config.
      </p>
    </section>
  );
}

export function EnvironmentsSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        How environments work
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Environments let you have different flag states per stage (e.g. development, staging, production). You can create them under{" "}
        <Link href="/gatehouse/environments" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Environments</Link>.
      </p>
      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
        <li>Each environment has a <strong>slug</strong> (e.g. <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">production</code>) used in code via <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GATEHOUSE_ENV</code>.</li>
        <li>Per flag and environment you can: turn the flag on/off, set a value, set a rollout percentage, and add targeting rules.</li>
        <li>Evaluation uses <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GATEHOUSE_ENV</code> to select which environment config to use — set it in <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">.env.local</code> or your deployment.</li>
      </ul>
    </section>
  );
}

export function CodeExamplesSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Code examples
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Use these snippets in your Next.js app. Ensure your root layout wraps the app with <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GatehouseProvider</code> and passes <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">flags</code> from <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">getAllFlags()</code> (see Client components below).
      </p>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Server components & API routes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Evaluate a single flag or all flags with optional user context.
          </p>
          <CodeBlock lang="ts">
{`import { getFlag, getAllFlags } from "@/lib/gatehouse";

// Single flag (boolean by default)
const enabled = getFlag<boolean>("new-checkout-flow");

// With user context (for targeting rules)
const flags = getAllFlags({ id: user.id, email: user.email });
const showBanner = flags["promo-banner"] === true;`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Client components
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Use <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">useFlag</code> inside components wrapped by <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">GatehouseProvider</code>. The root layout should fetch flags and pass them in.
          </p>
          <CodeBlock lang="tsx">
{`// In app/layout.tsx: wrap with GatehouseProvider and pass flags from getAllFlags()
import { getAllFlags } from "@/lib/gatehouse/sdk";
import { GatehouseProvider } from "@/lib/gatehouse/client";

const flags = await getAllFlags(); // or getAllFlags(context)
export default function Layout({ children }) {
  return (
    <GatehouseProvider flags={flags}>
      {children}
    </GatehouseProvider>
  );
}

// In any client component:
"use client";
import { useFlag } from "@/lib/gatehouse";

export function CheckoutButton() {
  const newCheckout = useFlag("new-checkout-flow", false);
  return newCheckout ? <NewCheckout /> : <LegacyCheckout />;
}`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Middleware (Edge)
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Evaluate a flag in middleware; useful for redirects or A/B at the edge. Uses the evaluate API with the request.
          </p>
          <CodeBlock lang="ts">
{`import { getFlagInMiddleware } from "@/lib/gatehouse";

export async function middleware(request: Request) {
  const useNewAuth = await getFlagInMiddleware("new-auth-flow", request);
  if (useNewAuth) {
    return NextResponse.redirect(new URL("/auth/v2", request.url));
  }
  return NextResponse.next();
}`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Optional: config file
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            For custom default context or shared config, use <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">gatehouse.config.ts</code> and call <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">createGatehouse()</code>. Then use <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">getFlag</code> / <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">getAllFlags</code> from <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono text-xs">@/lib/gatehouse</code> as above.
          </p>
          <CodeBlock lang="ts">
{`// gatehouse.config.ts
import { createGatehouse } from "@/lib/gatehouse";

export const gatehouse = createGatehouse({
  environment: process.env.GATEHOUSE_ENV || "development",
  dbPath: ".gatehouse/flags.db",
  secret: process.env.GATEHOUSE_SECRET,
  defaultContext: (request) => ({
    id: request?.headers?.get("x-user-id") ?? "anonymous",
  }),
});`}
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}

