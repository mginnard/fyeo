import { getAuditLog } from "@/lib/gatehouse/db";
import { AuditPageClient } from "./AuditPageClient";

const DB_PATH = process.env.GATEHOUSE_DB_PATH ?? ".gatehouse/flags.db";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const entries = getAuditLog({ limit: 200 }, DB_PATH);
  return <AuditPageClient initialEntries={entries} />;
}
