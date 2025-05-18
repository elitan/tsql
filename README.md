# tsql

A TypeScript SQL library built on top of [Kysely](https://github.com/kysely-org/kysely) with a simplified API.

## Features

- Type-safe query builder using Kysely
- Built-in type generation functionality similar to kysely-codegen
- Simple, consistent API focused on developer experience
- Written entirely in TypeScript with full type safety

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

// Now you can use db with Kysely's API
const users = await db
  .selectFrom("users")
  .selectAll()
  .where("email", "=", "user@example.com")
  .execute();
```

### Generating Types

You can generate TypeScript types from your database schema using the CLI:

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

`tsql` re-exports all the functionality from Kysely, so you can use it exactly as you would use Kysely.

### createTSQL

Creates a new database instance with the same API as Kysely.

```typescript
const db = createTSQL<Database>(config);
```

### generateTypes

Generates TypeScript types from your database schema.

```typescript
await generateTypes({
  url: "connection-string",
  dialect: "postgres", // 'postgres', 'mysql', 'sqlite', or 'mssql'
  outputPath: "path/to/output/file.d.ts",
  camelCase: false, // Optional
  verbose: false, // Optional
  additionalOptions: {}, // Optional, passed directly to kysely-codegen
});
```

## License

MIT
