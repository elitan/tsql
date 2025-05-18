#!/usr/bin/env node

import { generateTypes, TSQLCodegenOptions } from "./codegen/index.js";
import path from "path";

const DEFAULT_OUTPUT = "src/db.d.ts";

type CliAdditionalOptions = Record<string, string | boolean>;

function parseArgs(): TSQLCodegenOptions {
  const args = process.argv.slice(2);
  const options: TSQLCodegenOptions = {
    url: "",
    dialect: "postgres", // Default, will be validated later
    outputPath: DEFAULT_OUTPUT,
    camelCase: false,
    verbose: false,
    additionalOptions: {},
  };

  const cliAdditionalOptions: CliAdditionalOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--url" && i + 1 < args.length) {
      options.url = args[i + 1] || "";
      i++;
    } else if (arg === "--dialect" && i + 1 < args.length) {
      const dialectArg = args[i + 1] || "";
      if (
        dialectArg === "postgres" ||
        dialectArg === "mysql" ||
        dialectArg === "sqlite" ||
        dialectArg === "mssql"
      ) {
        options.dialect = dialectArg;
      } else {
        console.error(
          `Error: Invalid dialect "${dialectArg}". Must be one of: postgres, mysql, sqlite, mssql`
        );
        process.exit(1);
      }
      i++;
    } else if (arg === "--output" && i + 1 < args.length) {
      options.outputPath = args[i + 1] || "";
      i++;
    } else if (arg === "--camel-case") {
      options.camelCase = true;
    } else if (arg === "--verbose") {
      options.verbose = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg && arg.startsWith("--")) {
      // Handle additional options
      const optionName = arg.substring(2);
      const nextArg = i + 1 < args.length ? args[i + 1] : undefined;
      if (nextArg && !nextArg.startsWith("--")) {
        cliAdditionalOptions[optionName] = nextArg;
        i++;
      } else {
        cliAdditionalOptions[optionName] = true;
      }
    }
  }

  if (!options.url) {
    console.error("Error: --url option is required");
    printHelp();
    process.exit(1);
  }

  // Convert CLI additional options to the proper format
  if (Object.keys(cliAdditionalOptions).length > 0) {
    options.additionalOptions = cliAdditionalOptions;
  }

  return options;
}

function printHelp(): void {
  console.log(`
tsql - Generate TypeScript interfaces from database schema

Usage:
  tsql --url <connection-string> --dialect <dialect> [options]

Options:
  --url <connection-string>   Database connection string
  --dialect <dialect>         Database dialect (postgres, mysql, sqlite, mssql)
  --output <file-path>        Output file path (default: ${DEFAULT_OUTPUT})
  --camel-case                Use camelCase for column names
  --verbose                   Show verbose output
  --help, -h                  Show this help message

Any additional options will be passed directly to kysely-codegen.
  `);
}

async function main(): Promise<void> {
  const options = parseArgs();

  try {
    await generateTypes(options);
    if (options.verbose) {
      console.log("Type generation completed successfully");
    }
  } catch (error) {
    console.error("Error generating types:", error);
    process.exit(1);
  }
}

// Only run when this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
}
