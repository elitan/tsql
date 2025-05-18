import { createTSQL, Generated, PostgresDialect } from "../src";
import { Pool } from "pg";

interface Database {
  posts: {
    id: Generated<number>;
    title: string;
    content: string;
    published_at: string | null;
    updated_at: string | null;
  }[];
}

async function main() {
  // Create a Postgres connection pool
  const pool = new Pool({
    host: "localhost",
    database: "postgres",
    user: "postgres",
    password: "password",
  });

  // Create a TSQL instance
  const db = createTSQL<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  // Use the fluent API to build and execute queries
  const posts = await db.selectFrom("posts").selectAll().execute();

  console.log(posts);
}

main().catch(console.error);
