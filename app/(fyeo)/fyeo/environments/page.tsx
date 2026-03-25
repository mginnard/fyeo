import { listEnvironments, listFlags, getFlagEnvironments } from "@/lib/fyeo/db";
import { EnvironmentsClient } from "./EnvironmentsClient";

const DB_PATH = process.env.FYEO_DB_PATH ?? ".fyeo/flags.db";

export const dynamic = "force-dynamic";

export default async function EnvironmentsPage() {
  const environments = listEnvironments(DB_PATH);
  const flags = listFlags(undefined, DB_PATH);
  const counts: Record<string, number> = {};
  for (const flag of flags) {
    const feList = getFlagEnvironments(flag.id, DB_PATH);
    for (const fe of feList) {
      if (fe.enabled === 1) counts[fe.environment_id] = (counts[fe.environment_id] ?? 0) + 1;
    }
  }
  const envsWithCounts = environments.map((e) => ({
    ...e,
    enabledCount: counts[e.id] ?? 0,
  }));
  return <EnvironmentsClient initialEnvironments={envsWithCounts} />;
}
