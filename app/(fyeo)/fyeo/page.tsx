import { listFlags, listEnvironments, getFlagEnvironments } from "@/lib/fyeo/db";
import { FlagListClient } from "./FlagListClient";

export const dynamic = "force-dynamic";

export default async function FyeoPage() {
  const flags = listFlags(undefined, process.env.FYEO_DB_PATH ?? ".fyeo/flags.db");
  const environments = listEnvironments(process.env.FYEO_DB_PATH ?? ".fyeo/flags.db");
  const flagsWithEnvs = flags.map((flag) => {
    const feList = getFlagEnvironments(flag.id, process.env.FYEO_DB_PATH ?? ".fyeo/flags.db");
    const envConfigs = environments.map((env) => {
      const fe = feList.find((f) => f.environment_id === env.id);
      return {
        ...env,
        enabled: fe?.enabled ?? 0,
      };
    });
    return { ...flag, environments: envConfigs };
  });
  return (
    <FlagListClient
      initialFlags={flagsWithEnvs}
      environments={environments}
    />
  );
}
