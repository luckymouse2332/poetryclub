import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

import { parseDatabaseEnv } from "./src/server/validation/env";

if (!process.env.DATABASE_URL) {
  loadEnvConfig(process.cwd());
}
const env = parseDatabaseEnv(process.env);

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
