import { PluginError } from "./errors.js";

/** Typed key/value services shared between core and plugins (e.g. "i18n"). */
export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  provide<T>(key: string, service: T): void {
    if (this.services.has(key)) {
      throw new PluginError("duplicate-service", `Service "${key}" is already registered`);
    }
    this.services.set(key, service);
  }

  require<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new PluginError(
        "missing-dependency",
        `Service "${key}" is not registered. Is the plugin that provides it enabled?`,
      );
    }
    return this.services.get(key) as T;
  }

  has(key: string): boolean {
    return this.services.has(key);
  }
}
