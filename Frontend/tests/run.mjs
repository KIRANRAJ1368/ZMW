/**
 * Test runner: builds the SSR bundle for the real homepage components, then
 * hands off to node's built-in test runner.
 *
 * A Node script rather than an npm "&&" chain, because the Windows shell used
 * here is PowerShell 5.1, which does not support && as a statement separator.
 */
import { build } from "vite";
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

await build({
  configFile: path.join(here, "support", "vite.ssr.config.js"),
  logLevel: "warn"
});

const testFiles = readdirSync(here)
  .filter((f) => f.endsWith(".test.mjs") || f.endsWith(".test.js"))
  .map((f) => path.join(here, f));

if (testFiles.length === 0) {
  console.error("No test files found in", here);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  cwd: root,
  stdio: "inherit",
  // React's dev build is required: act() is unavailable in production builds.
  env: { ...process.env, NODE_ENV: "development" }
});

process.exit(result.status ?? 1);
