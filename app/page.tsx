import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">fyeo</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        Open-source feature flags for Next.js. Self-hosted, no vendor lock-in.
      </p>
      <Link
        href="/fyeo"
        className="px-5 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
      >
        Open dashboard
      </Link>
    </div>
  );
}
