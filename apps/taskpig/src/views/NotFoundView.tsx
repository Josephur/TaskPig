import { useT } from "@taskpig/plugin-i18n/react";
import type { JSX } from "react";
import { routeHref } from "../router";

export function NotFoundView(): JSX.Element {
  const t = useT();
  return (
    <section aria-labelledby="notfound-heading">
      <h2 id="notfound-heading">{t.t("notFound.title")}</h2>
      <p>{t.t("notFound.body")}</p>
      <a href={routeHref("tasks")}>{t.t("notFound.back")}</a>
    </section>
  );
}
