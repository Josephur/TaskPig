import { describe, expect, it } from "vitest";
import { PluginError } from "./errors.js";
import type { PluginModule } from "./manifest.js";
import { PluginRegistry } from "./registry.js";
import { fakePlugin } from "./test-utils.js";

function ids(modules: PluginModule[]): string[] {
  return modules.map((m) => m.manifest.id);
}

async function codeOf(fn: () => unknown): Promise<string> {
  try {
    await fn();
  } catch (error) {
    expect(error).toBeInstanceOf(PluginError);
    return (error as PluginError).code;
  }
  throw new Error("expected a PluginError");
}

describe("PluginRegistry", () => {
  it("orders dependencies before dependents", () => {
    const registry = new PluginRegistry();
    const base = fakePlugin({ manifest: { id: "base", version: "1.0.0" } });
    const top = fakePlugin({
      manifest: { id: "top", version: "1.0.0", requires: [{ id: "base", version: "^1.0.0" }] },
    });
    registry.register(top);
    registry.register(base);
    expect(ids(registry.resolveLoadOrder())).toEqual(["base", "top"]);
  });

  it("keeps registration order when nothing depends on anything", () => {
    const registry = new PluginRegistry();
    const a = fakePlugin({ manifest: { id: "a", version: "1.0.0" } });
    const b = fakePlugin({ manifest: { id: "b", version: "1.0.0" } });
    registry.register(a);
    registry.register(b);
    expect(ids(registry.resolveLoadOrder())).toEqual(["a", "b"]);
  });

  it("rejects duplicate ids", async () => {
    const registry = new PluginRegistry();
    registry.register(fakePlugin({ manifest: { id: "dup", version: "1.0.0" } }));
    await expect(
      codeOf(() => registry.register(fakePlugin({ manifest: { id: "dup", version: "2.0.0" } }))),
    ).resolves.toBe("duplicate-plugin");
  });

  it("names the missing dependency and who needs it", () => {
    const registry = new PluginRegistry();
    registry.register(
      fakePlugin({
        manifest: { id: "needy", version: "1.0.0", requires: [{ id: "ghost", version: "^1.0.0" }] },
      }),
    );
    try {
      registry.resolveLoadOrder();
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "missing-dependency" });
      expect(String(error)).toMatch(/needy.*ghost.*\^1\.0\.0/);
    }
  });

  it("reports found vs wanted versions on mismatch", () => {
    const registry = new PluginRegistry();
    registry.register(fakePlugin({ manifest: { id: "dep", version: "1.0.0" } }));
    registry.register(
      fakePlugin({
        manifest: { id: "needy", version: "1.0.0", requires: [{ id: "dep", version: "^2.0.0" }] },
      }),
    );
    try {
      registry.resolveLoadOrder();
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "version-mismatch" });
      expect(String(error)).toMatch(/\^2\.0\.0.*1\.0\.0/);
    }
  });

  it("shows the cycle chain", () => {
    const registry = new PluginRegistry();
    registry.register(
      fakePlugin({
        manifest: { id: "a", version: "1.0.0", requires: [{ id: "b", version: "*" }] },
      }),
    );
    registry.register(
      fakePlugin({
        manifest: { id: "b", version: "1.0.0", requires: [{ id: "a", version: "*" }] },
      }),
    );
    try {
      registry.resolveLoadOrder();
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "dependency-cycle" });
      expect(String(error)).toMatch(/a -> b -> a/);
    }
  });
});
