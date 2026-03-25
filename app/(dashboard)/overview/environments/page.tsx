import { EnvironmentsSection } from "../sections";

export default function EnvironmentsOverviewPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          How environments work
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          Understand how per-environment settings and rollouts are applied.
        </p>
      </div>
      <EnvironmentsSection />
    </div>
  );
}

