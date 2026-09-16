import { describe, expect, it } from "vitest";
import { createTestContext } from "./test-utils.js";

describe("SlotRegistry", () => {
  it("returns contributions in registration order", () => {
    const ctx = createTestContext();
    ctx.slots.defineSlot("demo");
    ctx.slots.contribute("demo", { pluginId: "a", id: "one", render: () => "one" });
    ctx.slots.contribute("demo", { pluginId: "b", id: "two", render: () => "two" });
    expect(ctx.slots.getContributions("demo").map((c) => c.id)).toEqual(["one", "two"]);
  });

  it("starts empty", () => {
    const ctx = createTestContext();
    ctx.slots.defineSlot("demo");
    expect(ctx.slots.getContributions("demo")).toEqual([]);
  });

  it("rejects contributions to undefined slots", () => {
    const ctx = createTestContext();
    expect(() =>
      ctx.slots.contribute("nope", { pluginId: "a", id: "x", render: () => null }),
    ).toThrowError(/not defined/);
    expect(() => ctx.slots.getContributions("nope")).toThrowError(/not defined/);
  });

  it("rejects duplicate slot definitions and contributions", () => {
    const ctx = createTestContext();
    ctx.slots.defineSlot("demo");
    expect(() => ctx.slots.defineSlot("demo")).toThrowError(/already defined/);
    ctx.slots.contribute("demo", { pluginId: "a", id: "x", render: () => null });
    expect(() =>
      ctx.slots.contribute("demo", { pluginId: "a", id: "x", render: () => null }),
    ).toThrowError(/already has contribution/);
  });
});
