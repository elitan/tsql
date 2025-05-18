import { createTSQL, PostgresDialect, Generated } from "../src";
import { Pool } from "pg";

// Example database schema
interface Database {
  users: {
    id: Generated<number>;
    name: string;
    email: string;
    created_at: Date;
  };
  posts: {
    id: Generated<number>;
    user_id: number;
    title: string;
    content: string;
    published: boolean;
    created_at: Date;
  };
}

async function main() {
  // Create a connection pool
  const pool = new Pool({
    host: "localhost",
    database: "example_db",
    user: "postgres",
    password: "password",
  });

  // Create a database instance
  const db = createTSQL<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  try {
    // Example: Create a new user
    const insertedUser = await db
      .insertInto("users")
      .values({
        name: "John Doe",
        email: "john@example.com",
        created_at: new Date(),
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    console.log(`Inserted user with ID: ${insertedUser.id}`);

    // Example: Query users
    const users = await db
      .selectFrom("users")
      .select(["id", "name", "email"])
      .where("email", "like", "%example.com")
      .execute();

    console.log("Users:", users);

    // Example: Join tables
    const userPosts = await db
      .selectFrom("users")
      .innerJoin("posts", "users.id", "posts.user_id")
      .select([
        "users.id as userId",
        "users.name",
        "posts.id as postId",
        "posts.title",
      ])
      .where("posts.published", "=", true)
      .execute();

    console.log("User posts:", userPosts);

    // Example: Transaction
    await db.transaction().execute(async (trx) => {
      // Perform multiple operations in a transaction
      await trx
        .insertInto("posts")
        .values({
          user_id: insertedUser.id,
          title: "My first post",
          content: "Hello, world!",
          published: true,
          created_at: new Date(),
        })
        .execute();

      // Update user
      await trx
        .updateTable("users")
        .set({ name: "John Smith" })
        .where("id", "=", insertedUser.id)
        .execute();
    });

    console.log("Transaction completed successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the example
main().catch(console.error);
