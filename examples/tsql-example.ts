import { createTSQL, Generated, PostgresDialect, sql, SqlBool } from "../dist";
import { Pool } from "pg";

// Define the database schema
interface Database {
  users: {
    id: Generated<number>;
    name: string;
    email: string;
    created_at: Date;
  };
  posts: {
    id: Generated<number>;
    title: string;
    content: string;
    user_id: number;
    published_at: Date | null;
  };
}

async function main() {
  // Create a Postgres connection pool
  const pool = new Pool({
    host: "localhost",
    database: "postgres",
    user: "postgres",
    password: "password",
  });

  // Initialize TSQL
  const db = createTSQL<Database>({
    dialect: new PostgresDialect({ pool }),
  });

  // Basic select query
  const users = await db.selectFrom("users").selectAll().execute();

  console.log("Users:", users);

  // Join with conditions
  const publishedPosts = await db
    .selectFrom("posts")
    .innerJoin("users", "users.id", "posts.user_id")
    .select(["posts.id", "posts.title", "users.name as author"])
    .where("posts.published_at", "is not", null)
    .execute();

  console.log("Published posts:", publishedPosts);

  // Using SQL expressions
  const searchTerm = "typescript";
  const searchResults = await db
    .selectFrom("posts")
    .select(["id", "title"])
    .where(sql<SqlBool>`content ILIKE ${`%${searchTerm}%`}`)
    .execute();

  console.log("Search results:", searchResults);

  // Insert data
  const newUser = await db
    .insertInto("users")
    .values({
      name: "Jane Doe",
      email: "jane@example.com",
      created_at: new Date(),
    })
    .returning("id")
    .executeTakeFirst();

  console.log("New user ID:", newUser?.id);

  // Clean up
  await pool.end();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
