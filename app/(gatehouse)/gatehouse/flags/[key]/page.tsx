import { notFound } from "next/navigation";
import { getFlagByKey, listEnvironments, getFlagEnvironments } from "@/lib/gatehouse/db";
import { getAuditLog } from "@/lib/gatehouse/db";
import { FlagDetailClient } from "./FlagDetailClient";

const DB_PATH = process.env.GATEHOUSE_DB_PATH ?? ".gatehouse/flags.db";

export const dynamic = "force-dynamic";

export default async function FlagDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);
  const flag = getFlagByKey(decodedKey, DB_PATH);
  if (!flag) notFound();
  const environments = listEnvironments(DB_PATH);
  const feList = getFlagEnvironments(flag.id, DB_PATH);
  const envConfigs = environments.map((env) => {
    const fe = feList.find((f) => f.environment_id === env.id);
    return {
      ...env,
      enabled: fe?.enabled ?? 0,
      value: fe?.value ?? null,
      rollout_percentage: fe?.rollout_percentage ?? 100,
      rules: fe?.rules ?? "[]",
    };
  });
  const auditEntries = getAuditLog({ flag: decodedKey, limit: 50 }, DB_PATH);
  return (
    <FlagDetailClient
      flag={{ ...flag, environments: envConfigs }}
      auditEntries={auditEntries}
    />
  );
}
