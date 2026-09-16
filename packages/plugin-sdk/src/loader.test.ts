import { describe, expect, it } from "vitest";
import { loadPlugins } from "./loader.js";
import { fakePlugin } from "./test-utils.js";

describe("loadPlugins", () => {
  it("activates in dependency order", async () => {
    const calls: string[] = [];
    const base = fakePlugin({
      manifest: { id: "base", version: "1.0.0" },
      activate: () => void calls.push("base"),
    });
    const top = fakePlugin({
      manifest: { id: "top", version: "1.0.0", requires: [{ id: "base", version: "*" }] },
      activate: async () => void calls.push("top"),
    });
    const { order, context } = await loadPlugins([top, base]);
    expect(order.map((m) => m.manifest.id)).toEqual(["base", "top"]);
    expect(calls).toEqual(["base", "top"]);
    expect(context.slots).toBeDefined();
    expect(context.commands).toBeDefined();
    expect(context.services).toBeDefined();
  });

  it("runs init before any activation", async () => {
    const seen: boolean[] = [];
    const plugin = fakePlugin({
      activate: (ctx) => void seen.push(ctx.slots.has("core.slot")),
    });
    await loadPlugins([plugin], { init: (ctx) => ctx.slots.defineSlot("core.slot") });
    expect(seen).toEqual([true]);
  });

  it("fails fast when a required plugin is missing", async () => {
    await expect(loadPlugins([], { requiredIds: ["taskpig.i18n"] })).rejects.toMatchObject({
      name: "PluginError",
      code: "missing-required-plugin",
    });
    await expect(loadPlugins([], { requiredIds: ["taskpig.i18n"] })).rejects.toThrow(
      /taskpig\.i18n/,
    );
  });

  it("hands each load fresh, isolated registries", async () => {
    const first = await loadPlugins([]);
    const second = await loadPlugins([]);
    expect(first.context.slots).not.toBe(second.context.slots);
    expect(first.context.commands).not.toBe(second.context.commands);
    expect(first.context.services).not.toBe(second.context.services);
  });
});
