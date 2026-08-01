import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/server/env";
import * as schema from "@/server/db/schema";

const globalForDatabase = globalThis as typeof globalThis & {
  poetryclubSql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDatabase.poetryclubSql ??
  postgres(getServerEnv().DATABASE_URL, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.poetryclubSql = sql;
}

export const db = drizzle(sql, { schema });
