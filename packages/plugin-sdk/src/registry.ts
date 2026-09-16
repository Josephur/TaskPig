import { PluginError } from "./errors.js";
import { validateManifest, type PluginModule } from "./manifest.js";
import { satisfies } from "./version.js";

export class PluginRegistry {
  private readonly plugins = new Map<string, PluginModule>();

  register(module: PluginModule): void {
    const manifest = validateManifest(module.manifest);
    if (this.plugins.has(manifest.id)) {
      throw new PluginError("duplicate-plugin", `Plugin "${manifest.id}" is already registered`);
    }
    this.plugins.set(manifest.id, { ...module, manifest });
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  get(id: string): PluginModule {
    const module = this.plugins.get(id);
    if (!module) {
      throw new PluginError("missing-dependency", `Plugin "${id}" is not registered`);
    }
    return module;
  }

  list(): PluginModule[] {
    return [...this.plugins.values()];
  }

  /** Activation order honoring requires; throws a clear PluginError on any problem. */
  resolveLoadOrder(): PluginModule[] {
    const order: PluginModule[] = [];
    const state = new Map<string, "visiting" | "done">();

    const visit = (id: string, chain: string[]): void => {
      const current = state.get(id);
      if (current === "done") return;
      if (current === "visiting") {
        throw new PluginError(
          "dependency-cycle",
          `Plugin dependency cycle: ${[...chain, id].join(" -> ")}`,
        );
      }
      state.set(id, "visiting");
      const module = this.plugins.get(id);
      if (!module) {
        throw new PluginError("missing-dependency", `Plugin "${id}" is not registered`);
      }
      for (const req of module.manifest.requires ?? []) {
        const dep = this.plugins.get(req.id);
        if (!dep) {
          throw new PluginError(
            "missing-dependency",
            `Plugin "${id}" requires "${req.id}" (${req.version}), which is not registered. ` +
              `Enable the "${req.id}" plugin.`,
          );
        }
        if (!satisfies(dep.manifest.version, req.version)) {
          throw new PluginError(
            "version-mismatch",
            `Plugin "${id}" requires "${req.id}" (${req.version}) ` +
              `but ${dep.manifest.version} is registered.`,
          );
        }
        visit(req.id, [...chain, id]);
      }
      state.set(id, "done");
      order.push(module);
    };

    for (const id of this.plugins.keys()) visit(id, []);
    return order;
  }
}
