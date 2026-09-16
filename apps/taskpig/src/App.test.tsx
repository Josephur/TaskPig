// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import { boot } from "./boot";

afterEach(() => {
  cleanup();
  window.location.hash = "#/";
});

describe("<App>", () => {
  it("renders the localized shell with slot contributions", async () => {
    window.location.hash = "#/";
    const loaded = await boot();
    loaded.context.slots.contribute("tasks.sidebar", {
      pluginId: "test.demo",
      id: "note",
      render: () => "sidebar-note",
    });
    render(<App loaded={loaded} />);
    expect(screen.getByText("TaskPig")).toBeDefined();
    expect(screen.getByRole("link", { name: "Tasks" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeDefined();
    expect(screen.getByText("No task provider connected")).toBeDefined();
    expect(screen.getByText("sidebar-note")).toBeDefined();
  });

  it("shows the plugin matrix with friendly names", async () => {
    const loaded = await boot();
    render(<App loaded={loaded} />);
    act(() => {
      window.location.hash = "#/settings";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("heading", { name: "Settings" })).toBeDefined();
    expect(screen.getByText("Language")).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Enabled" })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Author" })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Package" })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Version" })).toBeDefined();
    expect(screen.getByText("TaskPig Localization")).toBeDefined();
    expect(screen.getByText("Joseph Stackhouse")).toBeDefined();
    expect(screen.getByText("taskpig.i18n")).toBeDefined();
    expect(screen.getByText("v0.1.0")).toBeDefined();
    const toggle = screen.getByRole("checkbox", { name: "Toggle TaskPig Localization" });
    expect((toggle as HTMLInputElement).checked).toBe(true);
    expect((toggle as HTMLInputElement).disabled).toBe(true);
  });
});
