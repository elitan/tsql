# tSQL

tSQL is a type-safe SQL query builder and database toolkit for TypeScript.

```ts
const users = await db
  .selectFrom("users")
  .select(["id", "name", "email"])
  .execute();

// users is now typed as { id: number; name: string; email: string }[]
```

## Features

- **Fluent API**: Fully type-safe SQL query builder with a fluent API.
- **Automatic Type Generation**: Automatic type generation from your database schema.
- **Multi-Dialect Support**: Compatible with popular SQL databases including PostgreSQL, MySQL, SQLite, and MSSQL.

## Documentation

[tsql.space](https://tsql.space) is the official documentation for tSQL.

## Contributions

tSQL builds upon the excellent work of the following open-source projects:

- [Kysely](https://github.com/kysely-org/kysely): A type-safe SQL query builder for TypeScript.
- [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen): A code generator for Kysely.

We are grateful to the maintainers and contributors of these projects.

## License

MIT
