import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";

const url = import.meta.env.DATABASE_URL;

const client = postgres(url, {
  max: 1,
  idle_timeout: 0,
  ssl: import.meta.env.DATABASE_SSL === "true" ? "require" : false,
});

export const db = drizzle(client, { schema });
