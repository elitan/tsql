// Re-export everything from kysely
export * from "kysely";

// Export codegen functionality
export * from "./codegen";

// Import just what we need for createTSQL
import { Kysely, KyselyConfig } from "kysely";

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
