import { i18nPlugin } from "@taskpig/plugin-i18n";
import { fakePlugin } from "@taskpig/plugin-sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import { boot } from "./boot";
import { CORE_REQUIRED_PLUGINS, CORE_SLOTS } from "./plugins";

afterEach(() => vi.unstubAllGlobals());

describe("boot", () => {
  it("loads bundled plugins with i18n required and core slots defined", async () => {
    expect(CORE_REQUIRED_PLUGINS).toContain("taskpig.i18n");
    const { context, order } = await boot();
    expect(order.map((m) => m.manifest.id)).toContain("taskpig.i18n");
    for (const slot of CORE_SLOTS) expect(context.slots.has(slot)).toBe(true);
    expect(context.services.require("i18n")).toBeDefined();
  });

  it("warns for plugins that skip the i18n convention", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const plain = fakePlugin({ manifest: { id: "plain", version: "1.0.0" } });
      await boot([i18nPlugin, plain]);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"plain"'));
    } finally {
      warn.mockRestore();
    }
  });

  it("honors disabled plugins but never required ones", async () => {
    const store: Record<string, string> = {
      "taskpig.disabledPlugins": JSON.stringify(["taskpig.i18n", "taskpig.ghost"]),
    };
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => void (store[key] = value),
    });
    const { order } = await boot();
    expect(order.map((m) => m.manifest.id)).toEqual(["taskpig.i18n"]);
  });
});
