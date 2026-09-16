import { describe, expect, it } from "vitest";
import { PluginError } from "./errors.js";
import { parseVersion, satisfies } from "./version.js";

describe("parseVersion", () => {
  it("parses MAJOR.MINOR.PATCH", () => {
    expect(parseVersion("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it.each(["1.2", "v1.2.3", "1.2.3.4", "", "latest"])("rejects %p", (input) => {
    expect(() => parseVersion(input)).toThrowError(PluginError);
  });
});

describe("satisfies", () => {
  it("accepts everything for *", () => {
    expect(satisfies("1.2.3", "*")).toBe(true);
    expect(satisfies("99.0.0", "*")).toBe(true);
  });

  it("matches exact versions", () => {
    expect(satisfies("1.2.3", "1.2.3")).toBe(true);
    expect(satisfies("1.2.4", "1.2.3")).toBe(false);
  });

  it("matches caret ranges", () => {
    expect(satisfies("1.4.0", "^1.2.3")).toBe(true);
    expect(satisfies("1.2.9", "^1.2.3")).toBe(true);
    expect(satisfies("2.0.0", "^1.2.3")).toBe(false);
    expect(satisfies("1.2.0", "^1.2.3")).toBe(false);
  });

  it("uses 0.x caret semantics", () => {
    expect(satisfies("0.2.5", "^0.2.3")).toBe(true);
    expect(satisfies("0.3.0", "^0.2.3")).toBe(false);
    expect(satisfies("0.0.3", "^0.0.3")).toBe(true);
    expect(satisfies("0.0.4", "^0.0.3")).toBe(false);
  });
});
