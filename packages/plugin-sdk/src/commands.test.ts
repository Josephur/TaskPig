import { describe, expect, it } from "vitest";
import { createTestContext } from "./test-utils.js";

describe("CommandRegistry", () => {
  it("registers, lists, and executes commands", async () => {
    const ctx = createTestContext();
    ctx.commands.registerCommand({ id: "demo.hi", title: "Hi", run: () => "hello" });
    ctx.commands.registerCommand({
      id: "demo.async",
      title: () => "Async",
      run: async (args) => args,
    });
    expect(ctx.commands.listCommands().map((c) => c.id)).toEqual(["demo.hi", "demo.async"]);
    expect(await ctx.commands.execute("demo.hi")).toBe("hello");
    expect(await ctx.commands.execute("demo.async", { n: 1 })).toEqual({ n: 1 });
  });

  it("resolves lazy titles at render time", () => {
    const ctx = createTestContext();
    let label = "one";
    ctx.commands.registerCommand({ id: "demo.lazy", title: () => label, run: () => {} });
    expect(ctx.commands.resolveTitle(ctx.commands.getCommand("demo.lazy"))).toBe("one");
    label = "two";
    expect(ctx.commands.resolveTitle(ctx.commands.getCommand("demo.lazy"))).toBe("two");
  });

  it("rejects duplicates and unknown ids", async () => {
    const ctx = createTestContext();
    ctx.commands.registerCommand({ id: "demo.only", title: "Only", run: () => {} });
    expect(() =>
      ctx.commands.registerCommand({ id: "demo.only", title: "Again", run: () => {} }),
    ).toThrowError(/already registered/);
    expect(() => ctx.commands.getCommand("demo.missing")).toThrowError(/Unknown command/);
    await expect(ctx.commands.execute("demo.missing")).rejects.toThrowError(/Unknown command/);
  });
});
