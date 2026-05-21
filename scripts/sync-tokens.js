#!/usr/bin/env node
/**
 * sync-tokens.js
 *
 * Copies landing/tokens.json → web/tokens.json so the two frontends share
 * the same visual vocabulary. Run after editing landing/tokens.json.
 *
 * Usage:
 *   node scripts/sync-tokens.js
 *
 * Why this exists (per .planning/REORG-V2-PLAN.md):
 *   landing/ defines tokens (Bootstrap + custom CSS already consumes them
 *   via main.css). web/ must mirror them so Tailwind config can map them
 *   into shadcn primitives. Two flat files instead of a symlink so both
 *   modules are independently buildable on Vercel.
 *
 * The CI counterpart `check-tokens-sync.js` fails the build if the two
 * files have drifted.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "landing", "tokens.json");
const DEST = path.join(ROOT, "web", "tokens.json");

function hash(filePath) {
  const contents = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`✗ Source missing: ${SRC}`);
    process.exit(1);
  }

  // Validate JSON parses before copying
  try {
    JSON.parse(fs.readFileSync(SRC, "utf8"));
  } catch (err) {
    console.error(`✗ ${SRC} is not valid JSON: ${err.message}`);
    process.exit(1);
  }

  const webDir = path.dirname(DEST);
  if (!fs.existsSync(webDir)) {
    console.error(`✗ Web directory missing: ${webDir}. Run from a checked-out repo root.`);
    process.exit(1);
  }

  fs.copyFileSync(SRC, DEST);

  const srcHash = hash(SRC);
  const destHash = hash(DEST);

  if (srcHash !== destHash) {
    console.error(`✗ Copy failed: ${SRC} and ${DEST} differ after sync.`);
    process.exit(1);
  }

  console.log(`✓ Synced tokens: landing/tokens.json → web/tokens.json`);
  console.log(`  sha256: ${srcHash.slice(0, 16)}...`);
}

main();
