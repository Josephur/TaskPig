import { describe, expect, it } from "vitest";
import { createTestContext } from "./test-utils.js";

describe("ServiceRegistry", () => {
  it("provides and requires typed services", () => {
    const ctx = createTestContext();
    expect(ctx.services.has("i18n")).toBe(false);
    ctx.services.provide("i18n", { t: (key: string) => key });
    expect(ctx.services.has("i18n")).toBe(true);
    expect(ctx.services.require<{ t: (key: string) => string }>("i18n").t("a")).toBe("a");
  });

  it("rejects duplicates and explains missing services", () => {
    const ctx = createTestContext();
    ctx.services.provide("i18n", {});
    expect(() => ctx.services.provide("i18n", {})).toThrowError(/already registered/);
    expect(() => ctx.services.require("ghost")).toThrowError(/not registered.*enabled/);
  });
});
