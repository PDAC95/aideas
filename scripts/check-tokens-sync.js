#!/usr/bin/env node
/**
 * check-tokens-sync.js
 *
 * Fails (exit 1) if landing/tokens.json and web/tokens.json have drifted.
 * Run by CI on every PR and locally as a pre-commit guard.
 *
 * Usage:
 *   node scripts/check-tokens-sync.js
 *
 * Exit codes:
 *   0  files are byte-identical (or both absent, which is a separate problem
 *      callers can detect via their own existence check upstream).
 *   1  files differ — refuse to ship.
 *   2  one of the files is missing or unreadable.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const A = path.join(ROOT, "landing", "tokens.json");
const B = path.join(ROOT, "web", "tokens.json");

function hashOrExit(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`✗ Missing: ${filePath}`);
    process.exit(2);
  }
  try {
    const contents = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(contents).digest("hex");
  } catch (err) {
    console.error(`✗ Cannot read ${filePath}: ${err.message}`);
    process.exit(2);
  }
}

function main() {
  const hashA = hashOrExit(A);
  const hashB = hashOrExit(B);

  if (hashA === hashB) {
    console.log(`✓ Tokens in sync (sha256 ${hashA.slice(0, 16)}...)`);
    process.exit(0);
  }

  console.error("");
  console.error("✗ TOKEN DRIFT DETECTED");
  console.error("");
  console.error(`  landing/tokens.json  ${hashA.slice(0, 16)}...`);
  console.error(`  web/tokens.json      ${hashB.slice(0, 16)}...`);
  console.error("");
  console.error("  Fix with: node scripts/sync-tokens.js");
  console.error("");
  process.exit(1);
}

main();
