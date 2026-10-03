import type { db } from "@/server/db";

export type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
