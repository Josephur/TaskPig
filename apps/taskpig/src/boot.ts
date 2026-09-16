import { loadPlugins, type LoadedPlugins } from "@taskpig/plugin-sdk";
import { bundledPlugins, CORE_REQUIRED_PLUGINS, defineCoreSlots } from "./plugins";

export function boot(): Promise<LoadedPlugins> {
  return loadPlugins(bundledPlugins, {
    requiredIds: [...CORE_REQUIRED_PLUGINS],
    init: defineCoreSlots,
  });
}
