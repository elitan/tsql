# tSQL

A type-safe SQL query builder and database toolkit for TypeScript.

## Features

- Fully type-safe SQL query builder with a fluent API
- Automatic type generation from your database schema
- Database migrations support
- Transaction handling
- Written entirely in TypeScript with full type safety

## Getting Started

Follow these steps to get started with tSQL:

### 1. Install tSQL

```bash
npm install tsql
```

### 2. Generate Types

First, let's assume you have a `posts` table in your database with the following schema:

```sql
create table posts (
  id serial primary key,
  title text not null,
  content text not null,
  published_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
);
```

Now, generate TypeScript types from your database schema using the CLI. This step is crucial for leveraging tSQL's type safety. The `--camel-case` flag will ensure that snake_case column names (like `published_at`) are converted to camelCase (like `publishedAt`) in your generated types.

```bash
npx tsql codegen --url postgres://user:password@localhost/db_name --dialect postgres --output src/db.d.ts --camel-case
```

You can also add this to your `package.json` as a script for convenience:

```json
{
  "scripts": {
    "db:codegen": "tsql codegen --url postgres://user:password@localhost/db_name --dialect postgres --output src/db.d.ts --camel-case"
  }
}
```

Then run it

```bash
npm run db:codegen
```

This command will generate type definitions for your database schema in the `src/db.d.ts` file.

```typescript
export interface Posts {
  id: number;
  title: string;
  content: string;
  publishedAt: Date;
  updatedAt: Date;
}

export interface Database {
  posts: Posts;
}
```

### 3. Connect and Query Your Database

Once you have your types generated, you can import them and connect to your database to start writing type-safe queries.

```typescript
import { createTSQL, PostgresDialect } from "tsql";
import { CamelCasePlugin } from "kysely";
import type { Database } from "./src/db"; // Import the generated Database interface
import { Pool } from "pg";

// Create a Postgres connection pool
const pool = new Pool({
  host: "localhost",
  database: "my_db",
  user: "postgres",
  password: "password",
});

// Create a TSQL instance with CamelCasePlugin, using the imported Database type
const db = createTSQL<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});

async function main() {
  const recentPosts = await db
    .selectFrom("posts")
    .select(["id", "title", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(10)
    .execute();

  for (const post of recentPosts) {
    console.log("Post:", post);
  }

  await db.destroy();
}

main().catch(console.error);
```

## Contributions

tSQL builds upon the excellent work of the following open-source projects:

- [Kysely](https://github.com/kysely-org/kysely): A type-safe SQL query builder for TypeScript.
- [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen): A code generator for Kysely.

We are grateful to the maintainers and contributors of these projects.

## License

MIT

```

```
