import { describe, expect, it } from "vitest";
import { validateManifest } from "./manifest.js";

describe("validateManifest", () => {
  it("accepts a minimal manifest", () => {
    expect(validateManifest({ id: "taskpig.i18n", version: "0.1.0" })).toEqual({
      id: "taskpig.i18n",
      version: "0.1.0",
    });
  });

  it("accepts a full manifest", () => {
    const manifest = {
      id: "taskpig.provider.googletasks",
      version: "0.1.0",
      displayNameKey: "plugins.googletasks.name",
      author: "Test Author",
      provides: ["task.provider"],
      requires: [{ id: "taskpig.account.google", version: "^0.1.0" }],
      contributions: { slots: ["tasks.sidebar"], commands: ["tasks.refresh"] },
    };
    expect(validateManifest(manifest)).toEqual(manifest);
  });

  it.each([
    ["non-object", 42],
    ["missing id", { version: "1.0.0" }],
    ["blank id", { id: "", version: "1.0.0" }],
    ["id with spaces", { id: "has space", version: "1.0.0" }],
    ["non-string version", { id: "a.b", version: 3 }],
    ["short version", { id: "a.b", version: "1.2" }],
    ["blank displayNameKey", { id: "a.b", version: "1.0.0", displayNameKey: "" }],
    ["non-string displayNameKey", { id: "a.b", version: "1.0.0", displayNameKey: 7 }],
    ["blank author", { id: "a.b", version: "1.0.0", author: "" }],
    ["non-string author", { id: "a.b", version: "1.0.0", author: 7 }],
    ["provides not array", { id: "a.b", version: "1.0.0", provides: "x" }],
    ["requires not array", { id: "a.b", version: "1.0.0", requires: {} }],
    [
      "requirement without id",
      { id: "a.b", version: "1.0.0", requires: [{ version: "^1.0.0" }] },
    ],
    [
      "requirement with bad range",
      { id: "a.b", version: "1.0.0", requires: [{ id: "c.d", version: "soon" }] },
    ],
    ["contributions not object", { id: "a.b", version: "1.0.0", contributions: [] }],
    [
      "contributions.slots not array",
      { id: "a.b", version: "1.0.0", contributions: { slots: "x" } },
    ],
  ])("rejects %s", (_label, input) => {
    try {
      validateManifest(input);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ name: "PluginError", code: "invalid-manifest" });
    }
  });

  it("reports the PluginError code, not just a message", () => {
    try {
      validateManifest({ id: "bad id", version: "1.0.0" });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ name: "PluginError", code: "invalid-manifest" });
    }
  });
});
