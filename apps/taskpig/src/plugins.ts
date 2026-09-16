import type { PluginContext, PluginModule } from "@taskpig/plugin-sdk";
import { i18nPlugin } from "@taskpig/plugin-i18n";

/** Plugins shipped with the app. More join here as later phases land. */
export const bundledPlugins: PluginModule[] = [i18nPlugin];

/** IDs the app refuses to start without. */
export const CORE_REQUIRED_PLUGINS: readonly string[] = ["taskpig.i18n"];

/** Extension points core owns. Plugins contribute; they never replace views. */
export const CORE_SLOTS: readonly string[] = ["tasks.sidebar", "settings.sections"];

export function defineCoreSlots(ctx: PluginContext): void {
  for (const slot of CORE_SLOTS) ctx.slots.defineSlot(slot);
}
