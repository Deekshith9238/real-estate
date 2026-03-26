import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

/**
 * Dev convenience: allow the server to start without a database.
 *
 * Any code path that actually touches the DB will throw a clear error at runtime.
 */
function createMissingDbProxy(): any {
  const err = new Error(
    "DATABASE_URL is not set, so database-backed features are disabled.\n" +
      "Set DATABASE_URL to enable persistence (Postgres) and auth storage.",
  );

  return new Proxy(
    {},
    {
      get() {
        throw err;
      },
      set() {
        throw err;
      },
      apply() {
        throw err;
      },
      construct() {
        throw err;
      },
    },
  );
}

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : (undefined as unknown as pg.Pool);

export const db = databaseUrl ? drizzle(pool, { schema }) : createMissingDbProxy();
