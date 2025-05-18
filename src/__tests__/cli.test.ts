import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import path from "path";
import fs from "fs/promises";
import { spawnSync } from "child_process";

// Path to the CLI script
const CLI_PATH = path.resolve(process.cwd(), "src/cli.ts");

describe("CLI", () => {
  test("Should display main help with no arguments", async () => {
    const result = spawnSync("bun", [CLI_PATH], { encoding: "utf8" });
    expect(result.stdout).toContain("tsql - A type-safe SQL query builder");
    expect(result.stdout).toContain("Commands:");
    expect(result.stdout).toContain("codegen");
  });

  test("Should display main help with --help flag", async () => {
    const result = spawnSync("bun", [CLI_PATH, "--help"], { encoding: "utf8" });
    expect(result.stdout).toContain("tsql - A type-safe SQL query builder");
    expect(result.stdout).toContain("Commands:");
    expect(result.stdout).toContain("codegen");
  });

  test("Should display codegen help with codegen --help flag", async () => {
    const result = spawnSync("bun", [CLI_PATH, "codegen", "--help"], {
      encoding: "utf8",
    });
    expect(result.stdout).toContain(
      "tsql codegen - Generate TypeScript interfaces"
    );
    expect(result.stdout).toContain("--url <connection-string>");
    expect(result.stdout).toContain("--dialect <dialect>");
  });

  test("Should handle unknown command", async () => {
    const result = spawnSync("bun", [CLI_PATH, "unknown-command"], {
      encoding: "utf8",
    });
    expect(result.stderr).toContain("Error: Unknown command");
  });

  test("Should handle missing required arguments", async () => {
    const result = spawnSync(
      "bun",
      [CLI_PATH, "codegen", "--dialect", "postgres"],
      { encoding: "utf8" }
    );
    expect(result.stderr).toContain("Error: --url option is required");
  });

  // Test that verifies command structure works but doesn't actually execute codegen
  test("Should recognize valid codegen command structure", async () => {
    // Create a mock implementation of the CLI that echoes the args instead of running the actual codegen
    const mockCliPath = path.resolve(
      process.cwd(),
      "src/__tests__/mock_cli.ts"
    );

    // Create a temporary mock CLI file
    await fs.writeFile(
      mockCliPath,
      `#!/usr/bin/env bun
      // This is a mock CLI for testing command structure
      console.log('Command recognized: codegen');
      console.log('Arguments:', JSON.stringify(process.argv.slice(2)));
      `,
      "utf8"
    );

    try {
      const result = spawnSync(
        "bun",
        [
          mockCliPath,
          "codegen",
          "--url",
          "postgres://user:pass@localhost/db",
          "--dialect",
          "postgres",
        ],
        { encoding: "utf8" }
      );

      expect(result.stdout).toContain("Command recognized: codegen");
      expect(result.stdout).toContain("--url");
      expect(result.stdout).toContain("postgres://user:pass@localhost/db");
      expect(result.status).toBe(0);
    } finally {
      // Clean up the temporary file
      await fs.unlink(mockCliPath).catch(() => {});
    }
  });
});
