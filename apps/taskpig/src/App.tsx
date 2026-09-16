import type { LoadedPlugins } from "@taskpig/plugin-sdk";
import { I18N_SERVICE_KEY, type I18nService } from "@taskpig/plugin-i18n";
import { I18nProvider, useT } from "@taskpig/plugin-i18n/react";
import type { JSX } from "react";
import { routeHref, useRoute, type Route } from "./router";
import { NotFoundView } from "./views/NotFoundView";
import { SettingsView } from "./views/SettingsView";
import { TasksView } from "./views/TasksView";

export default function App({ loaded }: { loaded: LoadedPlugins }): JSX.Element {
  const i18n = loaded.context.services.require<I18nService>(I18N_SERVICE_KEY);
  return (
    <I18nProvider service={i18n}>
      <Shell loaded={loaded} />
    </I18nProvider>
  );
}

function Shell({ loaded }: { loaded: LoadedPlugins }): JSX.Element {
  const t = useT();
  const route = useRoute();
  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">{t.t("app.name")}</span>
        <nav className="nav">
          <a href={routeHref("tasks")}>{t.t("nav.tasks")}</a>
          <a href={routeHref("settings")}>{t.t("nav.settings")}</a>
        </nav>
      </header>
      <main className="content">{renderRoute(route, loaded)}</main>
    </div>
  );
}

function renderRoute(route: Route, loaded: LoadedPlugins): JSX.Element {
  switch (route) {
    case "tasks":
      return <TasksView context={loaded.context} />;
    case "settings":
      return <SettingsView loaded={loaded} />;
    case "notfound":
      return <NotFoundView />;
  }
}
