import type { Catalog } from "../types.js";

/**
 * Default English catalog. To translate TaskPig, copy this file to xx.ts,
 * translate the strings (keep keys, {variables}, and plural forms intact),
 * and register the catalog in plugin.ts.
 */
export const en: Catalog = {
  app: {
    name: "TaskPig",
  },
  nav: {
    tasks: "Tasks",
    settings: "Settings",
  },
  tasks: {
    title: "Tasks",
    noProviderTitle: "No task provider connected",
    noProviderBody: "Connect a task provider plugin to see your task lists here.",
    listCount: { one: "{count} list", other: "{count} lists" },
  },
  settings: {
    title: "Settings",
    languageLabel: "Language",
    languageName_en: "English",
    pluginsTitle: "Plugins",
    pluginsEmpty: "No plugins loaded.",
    pluginLabel: "{name} ({id}) v{version}",
  },
  notFound: {
    title: "Page not found",
    body: "That view does not exist.",
    back: "Back to tasks",
  },
  common: {
    loading: "Loading…",
    retry: "Retry",
    errorTitle: "Something went wrong",
  },
  plugins: {
    i18n: { name: "TaskPig Localization" },
  },
};
