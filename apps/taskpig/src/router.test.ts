// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseHash, routeHref, useRoute, type Route } from "./router";

const cases: Array<[string, Route]> = [
  ["", "tasks"],
  ["#", "tasks"],
  ["#/", "tasks"],
  ["#/settings", "settings"],
  ["#/settings/", "settings"],
  ["#/nope", "notfound"],
  ["#/tasks/123", "notfound"],
  ["#/Settings", "notfound"],
];

describe("parseHash", () => {
  it.each(cases)("%p -> %p", (hash, expected) => {
    expect(parseHash(hash)).toBe(expected);
  });
});

describe("routeHref", () => {
  it("builds hashes for known routes", () => {
    expect(routeHref("tasks")).toBe("#/");
    expect(routeHref("settings")).toBe("#/settings");
  });
});

describe("useRoute", () => {
  it("follows the location hash", () => {
    window.location.hash = "#/";
    const { result } = renderHook(() => useRoute());
    expect(result.current).toBe("tasks");
    act(() => {
      window.location.hash = "#/settings";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBe("settings");
  });
});
