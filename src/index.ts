import {
  Kysely,
  KyselyConfig,
  PostgresDialect,
  MysqlDialect,
  MssqlDialect,
  SqliteDialect,
  QueryCompiler,
  DialectAdapter,
  QueryExecutor,
  DatabaseConnection,
  Driver,
  Dialect,
  sql,
  SelectExpression,
  SelectQueryBuilder,
  InsertQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  InsertResult,
  UpdateResult,
  DeleteResult,
  ExpressionWrapper,
  SqlBool,
  Transaction,
  TransactionBuilder,
  RawBuilder,
  Selectable,
  Updateable,
  Insertable,
  Generated,
} from "kysely";

// Re-export all the main Kysely functionality
export {
  sql,
  SelectExpression,
  SqlBool,
  RawBuilder,
  ExpressionWrapper,
  Transaction,
  PostgresDialect,
  MysqlDialect,
  MssqlDialect,
  SqliteDialect,
  QueryCompiler,
  DialectAdapter,
  QueryExecutor,
  DatabaseConnection,
  Driver,
  Dialect,
  Kysely,
  Generated,
};

// Re-export kysely types
export type {
  Selectable,
  Updateable,
  Insertable,
  InsertResult,
  UpdateResult,
  DeleteResult,
  TransactionBuilder,
  KyselyConfig,
};

// Export codegen functionality
export * from "./codegen";

/**
 * Create a new Kysely database instance.
 * This is just a wrapper around the Kysely constructor for consistency
 * with the 'tsql' naming.
 */
export function createTSQL<DB>(config: KyselyConfig): Kysely<DB> {
  return new Kysely<DB>(config);
}

// Default export
export default createTSQL;
