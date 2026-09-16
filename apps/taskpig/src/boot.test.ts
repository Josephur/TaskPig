import { describe, expect, it } from "vitest";
import { boot } from "./boot";
import { CORE_REQUIRED_PLUGINS, CORE_SLOTS } from "./plugins";

describe("boot", () => {
  it("loads bundled plugins with i18n required and core slots defined", async () => {
    expect(CORE_REQUIRED_PLUGINS).toContain("taskpig.i18n");
    const { context, order } = await boot();
    expect(order.map((m) => m.manifest.id)).toContain("taskpig.i18n");
    for (const slot of CORE_SLOTS) expect(context.slots.has(slot)).toBe(true);
    expect(context.services.require("i18n")).toBeDefined();
  });
});
