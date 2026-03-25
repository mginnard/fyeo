import { createGatehouse } from "@/lib/gatehouse";

export const gatehouse = createGatehouse({
  environment: process.env.GATEHOUSE_ENV || "development",
  dbPath: ".gatehouse/flags.db",
  secret: process.env.GATEHOUSE_SECRET,
  defaultContext: (request) => ({
    id: request?.headers?.get("x-user-id") ?? "anonymous",
  }),
});
