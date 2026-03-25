import { CreatingAndUsingFlagsSection } from "../sections";

export default function CreatingAndUsingFlagsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Creating and using flags
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          Learn how to define flags and use them throughout your app.
        </p>
      </div>
      <CreatingAndUsingFlagsSection />
    </div>
  );
}

