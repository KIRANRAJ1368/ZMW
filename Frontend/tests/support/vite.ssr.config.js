import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, "../..");

/** Vite treats an alias replacement as a root-relative id unless it is an
 *  absolute posix-style path, so normalise Windows separators. */
const abs = (p) => p.replace(/\\/g, "/");

/**
 * Builds tests/support/entry.jsx (and the real homepage components it imports)
 * into a plain ESM bundle that node --test can import directly.
 */
export default defineConfig({
  root: frontendRoot,
  plugins: [react()],
  define: {
    "process.env.PUBLIC_URL": JSON.stringify(""),
    "process.env.REACT_APP_API_URL": JSON.stringify("http://localhost:5000")
  },
  resolve: {
    alias: [
      // Must match the *whole* specifier: rollup's alias replaces the matched
      // portion, so an anchored-anywhere pattern would leave "../../" in front.
      { find: /^.*context[\\/]ShopContext$/, replacement: abs(path.join(here, "mockShopContext.js")) }
    ]
  },
  build: {
    ssr: abs(path.join(here, "entry.jsx")),
    outDir: abs(path.join(here, ".build")),
    emptyOutDir: true,
    minify: false,
    target: "node18",
    rollupOptions: {
      output: { format: "es", entryFileNames: "entry.mjs" }
    }
  }
});
