import { fakePlugin } from "@taskpig/plugin-sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyDisabledFilter,
  buildPluginTree,
  loadDisabledIds,
  saveDisabledIds,
  toggleDisabled,
} from "./plugin-state";

const REQUIRED = ["taskpig.i18n"];

function memoryStorage(initial: Record<string, string> = {}): void {
  const store: Record<string, string> = { ...initial };
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => void (store[key] = value),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("disabled persistence", () => {
  it("round-trips and tolerates garbage", () => {
    memoryStorage();
    expect(loadDisabledIds()).toEqual([]);
    saveDisabledIds(["a.b"]);
    expect(loadDisabledIds()).toEqual(["a.b"]);
    memoryStorage({ "taskpig.disabledPlugins": "not-json{{" });
    expect(loadDisabledIds()).toEqual([]);
  });

  it("returns empty without storage", () => {
    expect(loadDisabledIds()).toEqual([]);
    expect(() => saveDisabledIds(["a.b"])).not.toThrow();
  });
});

describe("applyDisabledFilter", () => {
  it("filters disabled plugins but never required ones", () => {
    const keep = fakePlugin({ manifest: { id: "taskpig.i18n", version: "1.0.0" } });
    const drop = fakePlugin({ manifest: { id: "x.y", version: "1.0.0" } });
    expect(applyDisabledFilter([keep, drop], ["taskpig.i18n", "x.y"], REQUIRED)).toEqual([keep]);
  });
});

describe("toggleDisabled", () => {
  const dep = () => fakePlugin({ manifest: { id: "dep", version: "1.0.0" } });
  const top = () =>
    fakePlugin({
      manifest: { id: "top", version: "1.0.0", requires: [{ id: "dep", version: "*" }] },
    });

  it("disables an unrequired plugin and re-enables it", () => {
    const order = [dep(), top()];
    const off = toggleDisabled([], "top", order, REQUIRED);
    expect(off).toEqual({ ok: true, disabled: ["top"] });
    if (!off.ok) throw new Error("unreachable");
    expect(toggleDisabled(off.disabled, "top", order, REQUIRED)).toEqual({
      ok: true,
      disabled: [],
    });
  });

  it("blocks disabling while an enabled plugin requires it", () => {
    const order = [dep(), top()];
    expect(toggleDisabled([], "dep", order, REQUIRED)).toEqual({
      ok: false,
      blockedBy: ["top"],
    });
    // After disabling the dependant first, the dep can go too.
    expect(toggleDisabled(["top"], "dep", order, REQUIRED)).toEqual({
      ok: true,
      disabled: ["top", "dep"],
    });
  });

  it("blocks required plugins", () => {
    expect(toggleDisabled([], "taskpig.i18n", [dep()], REQUIRED).ok).toBe(false);
  });
});

describe("buildPluginTree", () => {
  it("keeps independent plugins flat", () => {
    const rows = buildPluginTree([
      fakePlugin({ manifest: { id: "a", version: "1.0.0" } }),
      fakePlugin({ manifest: { id: "b", version: "1.0.0" } }),
    ]);
    expect(rows.map((r) => [r.plugin.manifest.id, r.depth])).toEqual([
      ["a", 0],
      ["b", 0],
    ]);
  });

  it("nests requirements beneath dependants", () => {
    const rows = buildPluginTree([
      fakePlugin({ manifest: { id: "base", version: "1.0.0" } }),
      fakePlugin({
        manifest: { id: "top", version: "1.0.0", requires: [{ id: "base", version: "*" }] },
      }),
    ]);
    expect(rows.map((r) => [r.plugin.manifest.id, r.depth])).toEqual([
      ["top", 0],
      ["base", 1],
    ]);
  });

  it("terminates on cycles", () => {
    const rows = buildPluginTree([
      fakePlugin({
        manifest: { id: "a", version: "1.0.0", requires: [{ id: "b", version: "*" }] },
      }),
      fakePlugin({
        manifest: { id: "b", version: "1.0.0", requires: [{ id: "a", version: "*" }] },
      }),
    ]);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(10);
  });
});
