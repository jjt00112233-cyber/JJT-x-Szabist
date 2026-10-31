import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../drizzle/schema";

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  "";

if (!connectionString) {
  console.warn("DATABASE_URL or DATABASE_URL_POOLED is not configured.");
}

const sql = neon(connectionString, {
  disableWarningInBrowsers: true,
});

export const db = drizzle(sql, { schema });
