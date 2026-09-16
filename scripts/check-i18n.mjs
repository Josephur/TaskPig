#!/usr/bin/env node
/**
 * No hard-coded UI strings: every user-visible literal must come from the
 * Localization plugin. Parses .ts/.tsx sources and reports non-empty JSX
 * text nodes (whitespace-only formatting nodes are ignored).
 *
 * - Test files (*.test.ts[x]), node_modules, and dist/ are skipped.
 * - Attribute strings (id, className, aria-*, ...) are NOT checked: they are
 *   identifiers. Real user-visible attribute text (placeholder, alt, title)
 *   must still use t() — enforced by review, not by this script.
 * - Rare exemptions (e.g. the boot-failure screen, which renders before i18n
 *   exists) use a marker comment on the same or preceding line:
 *       // i18n:allow-literal -- reason
 *
 * Usage: node scripts/check-i18n.mjs [dir...]   (default: apps plugins packages)
 */
import { parse } from "@babel/parser";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MARKER = "i18n:allow-literal";
const ROOTS = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["apps", "plugins", "packages"];

function collect(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      collect(full, out);
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function violationsFor(file) {
  const source = readFileSync(file, "utf8");
  const tree = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const lines = source.split("\n");
  const found = [];
  const visit = (node) => {
    if (node?.type === "JSXText" && node.value.trim() !== "") {
      const lineNo = node.loc.start.line;
      const here = lines[lineNo - 1] ?? "";
      const above = lines[lineNo - 2] ?? "";
      if (!here.includes(MARKER) && !above.includes(MARKER)) {
        found.push({ file, line: lineNo, text: node.value.trim().slice(0, 60) });
      }
    }
    for (const value of Object.values(node ?? {})) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value?.type) visit(value);
    }
  };
  visit(tree.program);
  return found;
}

const files = ROOTS.flatMap((root) => collect(root));
const violations = files.flatMap(violationsFor);
if (violations.length > 0) {
  for (const v of violations) console.error(`${v.file}:${v.line}: hard-coded text "${v.text}"`);
  console.error(`\ni18n check failed: ${violations.length} violation(s) in ${files.length} file(s)`);
  process.exit(1);
}
console.log(`i18n check passed: ${files.length} file(s), no hard-coded JSX text`);
