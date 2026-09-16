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

  it("navigates to settings and lists loaded plugins", async () => {
    const loaded = await boot();
    render(<App loaded={loaded} />);
    act(() => {
      window.location.hash = "#/settings";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("heading", { name: "Settings" })).toBeDefined();
    expect(screen.getByText("Language")).toBeDefined();
    expect(
      screen.getByText("TaskPig Localization (taskpig.i18n) v0.1.0"),
    ).toBeDefined();
  });
});
