import { beforeEach, describe, expect, it, vi } from "vitest";
import { en } from "./catalogs/en.js";
import { I18nService } from "./service.js";
import type { Catalog } from "./types.js";

function service(catalogs: Record<string, Catalog> = { en }): I18nService {
  return new I18nService({ defaultLocale: "en", catalogs });
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("I18nService.t", () => {
  it("resolves nested keys", () => {
    expect(service().t("nav.tasks")).toBe("Tasks");
    expect(service().t("app.name")).toBe("TaskPig");
  });

  it("interpolates {named} variables and leaves unknown ones intact", () => {
    const svc = service({ en: { hi: "Hello, {name}! {missing} stays." } });
    expect(svc.t("hi", { name: "Pig" })).toBe("Hello, Pig! {missing} stays.");
  });

  it("falls back to the key on missing entries", () => {
    const svc = service();
    expect(svc.t("nope.missing")).toBe("nope.missing");
    expect(svc.t("nav")).toBe("nav");
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("nope.missing"));
  });
});

describe("I18nService.count", () => {
  it("selects plural forms per English rules", () => {
    const svc = service();
    expect(svc.count("tasks.listCount", 1)).toBe("1 list");
    expect(svc.count("tasks.listCount", 0)).toBe("0 lists");
    expect(svc.count("tasks.listCount", 12)).toBe("12 lists");
  });

  it("falls back to the key when plural data is missing", () => {
    expect(service().count("nope.missing", 2)).toBe("nope.missing");
  });
});

describe("locales", () => {
  it("switches locale and notifies subscribers", () => {
    const svc = service({ en, xx: { nav: { tasks: "Taches" } } });
    const seen: string[] = [];
    const stop = svc.subscribe(() => void seen.push(svc.locale));
    expect(svc.t("nav.tasks")).toBe("Tasks");
    svc.setLocale("xx");
    expect(svc.t("nav.tasks")).toBe("Taches");
    expect(svc.getSnapshot()).toBe("xx");
    stop();
    svc.setLocale("en");
    expect(seen).toEqual(["xx"]);
  });

  it("rejects unknown locales", () => {
    expect(() => service().setLocale("xx")).toThrowError(/Unknown locale "xx"/);
    expect(() => new I18nService({ defaultLocale: "xx", catalogs: { en } })).toThrowError(
      /Unknown default locale/,
    );
  });
});
