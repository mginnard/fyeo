import { GettingStartedSection } from "../sections";

export default function GettingStartedPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Getting started
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          Step-by-step guide to adding Gatehouse to your Next.js app.
        </p>
      </div>
      <GettingStartedSection />
    </div>
  );
}

