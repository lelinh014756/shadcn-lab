// Exports mapping.ts → mapping.json (artifact for consumers/CI)
// Run: npx ts-node --transpile-only --project scripts/tsconfig.json scripts/export-mapping.ts
//
// NOTE: mapping.ts and mapping.json share the same base name.
// Node resolves .json before ts-node can intercept .ts, so we:
// 1. Remove stale mapping.json first
// 2. Use dynamic require() so resolution happens after deletion
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";

const jsonPath = resolve(__dirname, "..", "mapping.json");

// Remove stale JSON so require('../mapping') resolves to mapping.ts
if (existsSync(jsonPath)) unlinkSync(jsonPath);

// Dynamic require — runs after unlinkSync, so ts-node finds mapping.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mapping } = require("../mapping") as { mapping: unknown[] };

const json = JSON.stringify(mapping, null, 2) + "\n";
writeFileSync(jsonPath, json, "utf-8");
console.log(`✓ Exported ${mapping.length} entries → mapping.json`);
