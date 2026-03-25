import { CodeExamplesSection } from "../sections";

export default function CodeExamplesPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Code examples
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          Copy-pastable snippets for using fyeo in server components, client components, and middleware.
        </p>
      </div>
      <CodeExamplesSection />
    </div>
  );
}

