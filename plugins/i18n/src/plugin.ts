import type { PluginContext, PluginModule } from "@taskpig/plugin-sdk";
import { en } from "./catalogs/en.js";
import { I18nService } from "./service.js";

export const I18N_SERVICE_KEY = "i18n";

export const i18nPlugin: PluginModule = {
  manifest: {
    id: "taskpig.i18n",
    version: "0.1.0",
    displayNameKey: "plugins.i18n.name",
    provides: ["i18n"],
  },
  activate: (ctx: PluginContext) => {
    ctx.services.provide(
      I18N_SERVICE_KEY,
      new I18nService({ defaultLocale: "en", catalogs: { en } }),
    );
  },
};
