import { getAuditLog } from "@/lib/fyeo/db";
import { AuditPageClient } from "./AuditPageClient";

const DB_PATH = process.env.FYEO_DB_PATH ?? ".fyeo/flags.db";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const entries = getAuditLog({ limit: 200 }, DB_PATH);
  return <AuditPageClient initialEntries={entries} />;
}
