import { createFyeo } from "@/lib/fyeo";

export const fyeo = createFyeo({
  environment: process.env.FYEO_ENV || "development",
  dbPath: ".fyeo/flags.db",
  secret: process.env.FYEO_SECRET,
  defaultContext: (request) => ({
    id: request?.headers?.get("x-user-id") ?? "anonymous",
  }),
});
