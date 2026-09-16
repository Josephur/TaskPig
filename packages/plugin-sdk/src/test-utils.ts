import { createPluginContext, type PluginContext } from "./context.js";
import { loadPlugins, type LoadedPlugins, type LoadOptions } from "./loader.js";
import type { PluginManifest, PluginModule } from "./manifest.js";

/** Fresh registries for plugin unit tests — never shared between tests. */
export function createTestContext(): PluginContext {
  return createPluginContext();
}

let counter = 0;

/** Build a throwaway plugin module, overriding whatever the test needs. */
export function fakePlugin(
  overrides: Partial<PluginModule> & { manifest?: Partial<PluginManifest> } = {},
): PluginModule {
  counter += 1;
  const { manifest: manifestOverrides, ...rest } = overrides;
  return {
    manifest: { id: `test.plugin-${counter}`, version: "1.0.0", ...manifestOverrides },
    activate: () => {},
    ...rest,
  };
}

export function loadTestPlugins(
  modules: PluginModule[],
  options: LoadOptions = {},
): Promise<LoadedPlugins> {
  return loadPlugins(modules, options);
}
