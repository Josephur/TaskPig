import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-i18n.mjs");

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), "i18n-check-"));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return dir;
}

describe("check-i18n.mjs", () => {
  it("fails on hard-coded JSX text and reports file:line", () => {
    const dir = fixture({
      "bad.tsx": `export const A = () => <p>Hello</p>;\n`,
      "ok.tsx": `export const B = (t) => <p>{t.t("key")}</p>;\n`,
    });
    try {
      assert.throws(
        () => execFileSync("node", [SCRIPT, dir], { stdio: "pipe" }),
        (error) => {
          const out = String(error.stderr);
          return out.includes("bad.tsx:1") && !out.includes("ok.tsx");
        },
        "should fail naming only the violating file",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("passes clean trees and honors the marker comment", () => {
    const dir = fixture({
      "ok.tsx": `export const B = (t) => <p>{t.t("key")}</p>;\n`,
      "allowed.tsx": `// i18n:allow-literal -- test\nconst A = () => <p>Hi</p>;\n`,
      "skip.test.tsx": `const A = () => <p>Test strings are fine</p>;\n`,
    });
    try {
      const out = execFileSync("node", [SCRIPT, dir], { encoding: "utf8" });
      assert.match(out, /no hard-coded JSX text/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
