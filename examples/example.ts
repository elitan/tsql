import { createTSQL, Generated, PostgresDialect, sql, SqlBool } from "../dist";
import { Pool } from "pg";

/*
create table posts (
    id serial primary key,
    title text not null,
    content text not null,
    published_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create table comments (
    id serial primary key,
    post_id integer references posts(id),
    author_name text not null,
    comment_text text not null,
    created_at timestamptz default current_timestamp
);
*/

// Define the database schema based on the new DDL
interface Database {
  posts: {
    id: Generated<number>;
    title: string;
    content: string;
    published_at: Date | null; // timestamptz DEFAULT CURRENT_TIMESTAMP
    updated_at: Date | null; // timestamptz DEFAULT CURRENT_TIMESTAMP
  };
  comments: {
    id: Generated<number>;
    post_id: number; // Foreign key to posts.id
    author_name: string;
    comment_text: string;
    created_at: Date | null; // timestamptz DEFAULT CURRENT_TIMESTAMP
  };
}

async function main() {
  // Create a Postgres connection pool
  // Ensure your PostgreSQL server is running and accessible.
  // Update connection details if necessary (e.g., host, database, user, password).
  const pool = new Pool({
    host: "localhost",
    database: "postgres", // Database name where tables defined in the DDL are created
    user: "postgres", // Your PostgreSQL username
    password: "password", // Your PostgreSQL password
  });

  // Initialize TSQL
  const db = createTSQL<Database>({
    dialect: new PostgresDialect({ pool }),
  });

  try {
    // Basic select query for posts
    console.log("Fetching all posts...");
    const allPosts = await db.selectFrom("posts").selectAll().execute();
    console.log(
      "All posts:",
      allPosts.length > 0 ? allPosts : "No posts found."
    );

    // Join posts with their comments (using leftJoin to include posts without comments)
    console.log("\\nFetching posts with their comments...");
    const postsWithComments = await db
      .selectFrom("posts")
      .leftJoin("comments", "comments.post_id", "posts.id")
      .select([
        "posts.id as post_id",
        "posts.title as post_title",
        "posts.content as post_content",
        "comments.id as comment_id",
        "comments.author_name",
        "comments.comment_text",
        "comments.created_at as comment_created_at",
      ])
      .where("posts.published_at", "is not", null) // Example: only for published posts
      .orderBy("posts.id", "asc")
      .orderBy("comments.id", "asc") // Order comments for each post
      .execute();
    console.log(
      "Posts with comments:",
      postsWithComments.length > 0
        ? postsWithComments
        : "No posts with comments found (matching criteria)."
    );

    // Using SQL expressions to search posts
    const searchTerm = "tsql"; // Example search term
    console.log(`\\nSearching posts for content containing "${searchTerm}"...`);
    const pattern = `%${searchTerm}%`; // Pre-construct the pattern
    const searchResults = await db
      .selectFrom("posts")
      .select(["id", "title", "content"])
      .where(sql<SqlBool>`content ILIKE ${pattern}`) // Use the pre-constructed pattern
      .execute();
    console.log(
      "Search results:",
      searchResults.length > 0
        ? searchResults
        : `No posts found with term "${searchTerm}".`
    );

    // Insert a new post
    console.log("\\nInserting a new post...");
    const newPostValues = {
      title: "Exploring TSQL Features",
      content:
        "A deep dive into TSQL and its capabilities with PostgreSQL. This post covers common operations.",
      published_at: new Date(), // Explicitly set published_at
      // updated_at will be set by DB default (CURRENT_TIMESTAMP)
    };
    const newPost = await db
      .insertInto("posts")
      .values(newPostValues)
      .returningAll() // Returns all columns of the inserted post
      .executeTakeFirst(); // Use executeTakeFirstOrThrow() if insertion is critical

    console.log("New post created:", newPost);

    if (newPost) {
      // Insert a comment for the new post
      console.log(`\\nInserting a comment for post ID ${newPost.id}...`);
      const newCommentValues = {
        post_id: newPost.id,
        author_name: "AI Commenter",
        comment_text: "This is a great example of TSQL in action!",
        // created_at will be set by DB default (CURRENT_TIMESTAMP)
      };
      const newComment = await db
        .insertInto("comments")
        .values(newCommentValues)
        .returningAll()
        .executeTakeFirst(); // Or executeTakeFirstOrThrow()

      console.log("New comment created:", newComment);

      // Example: Update the post
      console.log(`\\nUpdating post ID ${newPost.id}...`);
      const updatedPost = await db
        .updateTable("posts")
        .set({
          title: newPost.title + " (Updated with additional insights)",
          updated_at: new Date(),
        }) // Explicitly set updated_at
        .where("id", "=", newPost.id)
        .returningAll()
        .executeTakeFirst(); // Or executeTakeFirstOrThrow()
      console.log("Updated post:", updatedPost);

      // Example: Delete the comment (if it was created)
      if (newComment) {
        console.log(`\\nDeleting comment ID ${newComment.id}...`);
        const deleteResults = await db
          .deleteFrom("comments")
          .where("id", "=", newComment.id)
          .execute(); // execute() returns an array of result objects (e.g., [DeleteResult])

        console.log("Delete comment operation results:", deleteResults);
        if (deleteResults.length > 0 && deleteResults[0]) {
          console.log(
            "Details of first delete result object:",
            deleteResults[0]
          );
          // User can inspect deleteResults[0] to see numAffectedRows or similar properties based on dialect.
        }
      }
    } else {
      console.log(
        "\\nSkipping comment insertion, post update, and comment deletion as post creation failed or returned no result."
      );
    }
  } catch (err) {
    console.error("\\n--- An error occurred during database operations ---");
    console.error(err);
    // Depending on the error, you might want to re-throw it or handle it more specifically
  } finally {
    // Clean up: close the database connection pool
    // This block executes whether the try block succeeded or failed
    console.log("\\nClosing database connection pool...");
    await pool.end();
    console.log("Database connection pool closed.");
  }
  console.log("Example script operations complete.");
}

main().catch((error) => {
  // This catches errors from the main() async function itself or unhandled rejections
  // from its promise chain, including potential errors during pool.end() if main()
  // threw an error before reaching its own finally block.
  console.error("\\n--- Critical error in script execution ---");
  console.error(error);
  process.exit(1); // Exit with an error code
});
