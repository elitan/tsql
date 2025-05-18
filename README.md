# tsql

A type-safe SQL query builder and database toolkit for TypeScript.

## Features

- Fully type-safe SQL query builder with a fluent API
- Automatic type generation from your database schema
- Database migrations support
- Transaction handling
- Written entirely in TypeScript with full type safety

## Type Safety in Action

```typescript
// Write SQL queries with full type safety
const user = await db
  .selectFrom("users")
  .select(["id", "name", "email"])
  .where("id", "=", 1)
  .executeTakeFirst();

// TypeScript knows the exact type:
// user: { id: number; name: string; email: string } | undefined

if (user) {
  // Full autocomplete for all properties
  user.id; // number
  user.name; // string
  user.email; // string

  // Compile-time error detection:
  user.age; // Error: Property 'age' does not exist
}

// Type checking on conditions
db.selectFrom("users")
  .where("active", "=", "yes") // Type error: column 'active' expects boolean, not string
  .execute();

// Type-safe inserts and updates
await db.insertInto("users").values({
  name: "Jane", // string ✓
  email: "jane@test.com", // string ✓
  active: true, // boolean ✓
  // id is auto-generated, TypeScript knows it's not required
});
```

## Installation

```bash
bun add tsql
```

or with npm:

```bash
npm install tsql
```

## Usage

### Creating a Database Connection

```typescript
import { createTSQL, PostgresDialect } from "tsql";
import { Pool } from "pg";

// Create a Postgres connection pool
const pool = new Pool({
  host: "localhost",
  database: "my_db",
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
const users = await db
  .selectFrom("users")
  .selectAll()
  .where("email", "=", "user@example.com")
  .execute();
```

### Generating Types

Generate TypeScript types from your database schema using the CLI:

```bash
npx tsql --url postgres://user:password@localhost/db_name --dialect postgres --output src/db.d.ts
```

Or programmatically:

```typescript
import { generateTypes } from "tsql";

await generateTypes({
  url: "postgres://user:password@localhost/db_name",
  dialect: "postgres",
  outputPath: "src/db.d.ts",
  camelCase: true,
  verbose: true,
});
```

## API

### createTSQL

Creates a new database instance with full type safety.

```typescript
const db = createTSQL<Database>(config);
```

### Query Building

tsql provides a fluent, type-safe API for building SQL queries:

```typescript
// Select queries
const users = await db
  .selectFrom("users")
  .select(["id", "name", "email"])
  .where("active", "=", true)
  .execute();

// Insert operations
const newUser = await db
  .insertInto("users")
  .values({
    name: "John Doe",
    email: "john@example.com",
  })
  .returning("id")
  .executeTakeFirstOrThrow();

// Update operations
await db
  .updateTable("users")
  .set({ lastLogin: new Date() })
  .where("id", "=", userId)
  .execute();

// Delete operations
await db.deleteFrom("users").where("inactive", "=", true).execute();
```

### Transactions

```typescript
await db.transaction().execute(async (trx) => {
  // All queries in here are part of the same transaction
  const userId = await trx
    .insertInto("users")
    .values(newUser)
    .returning("id")
    .executeTakeFirstOrThrow();

  await trx
    .insertInto("user_settings")
    .values({
      userId: userId.id,
      theme: "dark",
    })
    .execute();
});
```

### Type Generation

Generate TypeScript types from your database schema:

```typescript
await generateTypes({
  url: "connection-string",
  dialect: "postgres", // 'postgres', 'mysql', 'sqlite', or 'mssql'
  outputPath: "path/to/output/file.d.ts",
  camelCase: false, // Optional
  verbose: false, // Optional
  additionalOptions: {}, // Optional additional config options
});
```

## License

MIT
