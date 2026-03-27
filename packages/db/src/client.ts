import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

// Use pooled URL for runtime (PgBouncer), direct URL for migrations
const connectionString =
  process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL!;

const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
