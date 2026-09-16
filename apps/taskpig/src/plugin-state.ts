import type { PluginModule } from "@taskpig/plugin-sdk";

const STORAGE_KEY = "taskpig.disabledPlugins";

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadDisabledIds(): string[] {
  const store = storage();
  if (!store) return [];
  try {
    const parsed: unknown = JSON.parse(store.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function saveDisabledIds(ids: string[]): void {
  storage()?.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Filter disabled plugins; required IDs always survive (defense in depth). */
export function applyDisabledFilter(
  plugins: PluginModule[],
  disabledIds: string[],
  requiredIds: readonly string[],
): PluginModule[] {
  const effective = new Set(disabledIds.filter((id) => !requiredIds.includes(id)));
  return plugins.filter((plugin) => !effective.has(plugin.manifest.id));
}

export type ToggleResult = { ok: true; disabled: string[] } | { ok: false; blockedBy: string[] };

/**
 * Toggle one plugin. Disabling is blocked while an enabled plugin requires
 * it (block, never surprise-cascade); enabling always succeeds.
 */
export function toggleDisabled(
  disabledIds: string[],
  id: string,
  order: PluginModule[],
  requiredIds: readonly string[],
): ToggleResult {
  if (requiredIds.includes(id)) return { ok: false, blockedBy: [] };
  const disabled = new Set(disabledIds);
  if (disabled.has(id)) {
    disabled.delete(id);
    return { ok: true, disabled: [...disabled] };
  }
  const dependants = order
    .filter(
      (plugin) =>
        !disabled.has(plugin.manifest.id) &&
        (plugin.manifest.requires ?? []).some((req) => req.id === id),
    )
    .map((plugin) => plugin.manifest.id);
  if (dependants.length > 0) return { ok: false, blockedBy: dependants };
  disabled.add(id);
  return { ok: true, disabled: [...disabled] };
}

export interface PluginTreeRow {
  plugin: PluginModule;
  depth: number;
}

/**
 * Nest each plugin's requirements beneath it (npm-ls style: shared deps
 * repeat under each parent). Roots are plugins nothing requires. Cycle-safe.
 */
export function buildPluginTree(order: PluginModule[]): PluginTreeRow[] {
  const byId = new Map(order.map((plugin) => [plugin.manifest.id, plugin]));
  const requiredBySomeone = new Set<string>();
  for (const plugin of order) {
    for (const req of plugin.manifest.requires ?? []) requiredBySomeone.add(req.id);
  }
  const rows: PluginTreeRow[] = [];
  const visiting = new Set<string>();
  const emit = (plugin: PluginModule, depth: number): void => {
    if (visiting.has(plugin.manifest.id)) return;
    visiting.add(plugin.manifest.id);
    rows.push({ plugin, depth });
    for (const req of plugin.manifest.requires ?? []) {
      const dep = byId.get(req.id);
      if (dep) emit(dep, depth + 1);
    }
    visiting.delete(plugin.manifest.id);
  };
  const roots = order.filter((plugin) => !requiredBySomeone.has(plugin.manifest.id));
  for (const root of roots.length > 0 ? roots : order) emit(root, 0);
  return rows;
}
