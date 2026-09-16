// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider, useT } from "./react.js";
import { I18nService } from "./service.js";

afterEach(() => cleanup());

function Label(): JSX.Element {
  const t = useT();
  return <span>{t.t("nav.tasks")}</span>;
}

describe("I18nProvider/useT", () => {
  it("provides translations and re-renders on locale change", () => {
    const svc = new I18nService({
      defaultLocale: "en",
      catalogs: { en: { nav: { tasks: "Tasks" } }, xx: { nav: { tasks: "Taches" } } },
    });
    render(
      <I18nProvider service={svc}>
        <Label />
      </I18nProvider>,
    );
    expect(screen.getByText("Tasks")).toBeDefined();
    act(() => svc.setLocale("xx"));
    expect(screen.getByText("Taches")).toBeDefined();
  });

  it("throws outside a provider", () => {
    expect(() => render(<Label />)).toThrowError(/I18nProvider/);
  });
});
