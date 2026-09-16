import { loadPlugins, type LoadedPlugins, type PluginModule } from "@taskpig/plugin-sdk";
import { applyDisabledFilter, loadDisabledIds } from "./plugin-state";
import { bundledPlugins, CORE_REQUIRED_PLUGINS, defineCoreSlots } from "./plugins";

export function boot(plugins: PluginModule[] = bundledPlugins): Promise<LoadedPlugins> {
  const enabled = applyDisabledFilter(plugins, loadDisabledIds(), CORE_REQUIRED_PLUGINS);
  warnForMissingI18n(enabled);
  return loadPlugins(enabled, {
    requiredIds: [...CORE_REQUIRED_PLUGINS],
    init: defineCoreSlots,
  });
}

/**
 * Convention (warned, not fatal): every plugin requires taskpig.i18n and
 * ships US English strings first, so no plugin ever hard-codes UI text.
 */
function warnForMissingI18n(plugins: PluginModule[]): void {
  for (const plugin of plugins) {
    const { id, requires } = plugin.manifest;
    if (id === "taskpig.i18n") continue;
    if (!(requires ?? []).some((req) => req.id === "taskpig.i18n")) {
      console.warn(
        `[taskpig] Plugin "${id}" should require "taskpig.i18n" and ship US English ` +
          `strings via registerStrings() (see docs/plugin-authoring.md).`,
      );
    }
  }
}
