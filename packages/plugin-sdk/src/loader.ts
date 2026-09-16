import type { PluginContext } from "./context.js";
import { createPluginContext } from "./context.js";
import { PluginError } from "./errors.js";
import type { PluginModule } from "./manifest.js";
import { PluginRegistry } from "./registry.js";

export interface LoadOptions {
  /** Plugin IDs core cannot run without (e.g. the Localization plugin). */
  requiredIds?: string[];
  /** Runs after registries exist but before any activate(); core defines slots here. */
  init?: (ctx: PluginContext) => void;
}

export interface LoadedPlugins {
  order: PluginModule[];
  context: PluginContext;
}

export async function loadPlugins(
  modules: PluginModule[],
  options: LoadOptions = {},
): Promise<LoadedPlugins> {
  const registry = new PluginRegistry();
  for (const module of modules) registry.register(module);
  const order = registry.resolveLoadOrder();

  const missing = (options.requiredIds ?? []).filter((id) => !registry.has(id));
  if (missing.length > 0) {
    throw new PluginError(
      "missing-required-plugin",
      `Missing required plugin(s): ${missing.join(", ")}. The app cannot start without them.`,
    );
  }

  const context = createPluginContext();
  options.init?.(context);
  for (const module of order) {
    await module.activate(context);
  }
  return { order, context };
}
