// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slot } from "./react.js";
import { createTestContext } from "./test-utils.js";

describe("<Slot>", () => {
  it("renders contributions in order with slot props", () => {
    const ctx = createTestContext();
    ctx.slots.defineSlot("demo");
    ctx.slots.contribute<{ label: string }>("demo", {
      pluginId: "a",
      id: "one",
      render: (props) => <span>one:{props.label}</span>,
    });
    ctx.slots.contribute("demo", {
      pluginId: "b",
      id: "two",
      render: () => <span>two</span>,
    });
    render(<Slot name="demo" slots={ctx.slots} slotProps={{ label: "hi" }} />);
    expect(screen.getByText("one:hi")).toBeDefined();
    expect(screen.getByText("two")).toBeDefined();
  });

  it("renders the fallback when empty", () => {
    const ctx = createTestContext();
    ctx.slots.defineSlot("demo");
    const { container } = render(
      <Slot name="demo" slots={ctx.slots} fallback={<span>empty</span>} />,
    );
    expect(screen.getByText("empty")).toBeDefined();
    expect(container.textContent).toBe("empty");
  });

  it("throws for undefined slots", () => {
    const ctx = createTestContext();
    expect(() => render(<Slot name="nope" slots={ctx.slots} />)).toThrowError(/not defined/);
  });
});
