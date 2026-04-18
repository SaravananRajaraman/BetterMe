#!/usr/bin/env node
/**
 * generate-build-info.mjs
 * Runs before next build / next dev to capture git info and write
 * src/lib/build-info.ts so the app can display version + commit hash.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// --- version from package.json ---
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const version = pkg.version ?? "0.0.0";

// --- git commit hash (short) ---
let commitHash = "unknown";
try {
  commitHash = execSync("git rev-parse --short HEAD", {
    cwd: root,
    stdio: ["pipe", "pipe", "pipe"],
  })
    .toString()
    .trim();
} catch {
  // git not available (e.g. in some CI environments or shallow clones)
  commitHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown";
}

// --- environment ---
const environment = process.env.NODE_ENV ?? "development";

// --- timestamp ---
const timestamp = new Date().toISOString();

// --- write the file ---
const output = `// AUTO-GENERATED — do not edit. Re-created on every build/dev start.
// See scripts/generate-build-info.mjs

export const BUILD_VERSION = "${version}";
export const COMMIT_HASH = "${commitHash}";
export const BUILD_TIMESTAMP = "${timestamp}";
export const BUILD_ENVIRONMENT = "${environment}";
`;

const outPath = resolve(root, "src/lib/build-info.ts");
writeFileSync(outPath, output, "utf8");

console.log(
  `[build-info] v${version} · ${commitHash} · ${timestamp} · ${environment}`
);
