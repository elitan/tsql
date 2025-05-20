import path from "path";
import fs from "fs/promises";
import {
  Kysely,
  KyselyConfig,
  DatabaseConnection,
  CompiledQuery,
  sql,
} from "kysely";
import type { GenerateOptions as KyselyGenerateOptions } from "kysely-codegen";
import { spawn } from "child_process";

// Simplified options interface for CLI usage
export interface TSQLCodegenOptions {
  /**
   * The database connection string
   */
  url: string;

  /**
   * The dialect to use (postgres, mysql, sqlite, etc.)
   */
  dialect: "postgres" | "mysql" | "sqlite" | "mssql";

  /**
   * The output file path
   */
  outputPath: string;

  /**
   * Whether to use camelCase for column names
   */
  camelCase?: boolean;

  /**
   * Whether to log the generated types
   */
  verbose?: boolean;

  /**
   * Additional kysely-codegen options
   * This is a simplified version for the CLI - we'll handle the conversion internally
   */
  additionalOptions?: Record<string, string | boolean>;
}

/**
 * Generate TypeScript interfaces from a database schema
 */
export function generateTypes(options: TSQLCodegenOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const { url, dialect, outputPath, camelCase, verbose, additionalOptions } =
      options;

    const args = [
      "kysely-codegen",
      "--url",
      url,
      "--dialect",
      dialect,
      "--out-file",
      outputPath,
    ];

    if (camelCase) {
      args.push("--camel-case");
    }

    if (additionalOptions) {
      Object.entries(additionalOptions).forEach(([key, value]) => {
        if (value === true) {
          args.push(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`);
        } else if (value !== false && value !== undefined && value !== null) {
          args.push(
            `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
            String(value)
          );
        }
      });
    }

    if (verbose) {
      console.log(`Running: npx ${args.join(" ")}`);
    }

    const childProcess = spawn("npx", args, {
      stdio: verbose ? "inherit" : "pipe",
    });

    let stderrData = "";
    if (childProcess.stderr && !verbose) {
      childProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });
    }

    childProcess.on("close", (code) => {
      if (code === 0) {
        if (verbose) {
          console.log(`Generated database types to ${outputPath}`);
        }
        resolve();
      } else {
        let errorMsg = `TSQL code generation failed with exit code ${code}.`;
        if (stderrData) {
          errorMsg += `\nDetails:\n${stderrData}`;
        }
        reject(new Error(errorMsg));
      }
    });

    childProcess.on("error", (err) => {
      // This 'error' event is for issues like the command not being found
      reject(new Error(`TSQL code generation failed to start: ${err.message}`));
    });
  });
}
