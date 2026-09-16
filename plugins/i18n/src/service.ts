import type { Catalog, CatalogValue, InterpVars, PluralForms } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPluralForms(value: unknown): value is PluralForms {
  return isRecord(value) && typeof value.other === "string";
}

function lookup(catalog: Catalog, key: string): CatalogValue | undefined {
  let node: CatalogValue | undefined = catalog;
  for (const part of key.split(".")) {
    if (!isRecord(node)) return undefined;
    const record: Record<string, unknown> = node;
    node = record[part] as CatalogValue | undefined;
  }
  return node;
}

function interpolate(template: string, vars: InterpVars): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

function deepMerge(base: unknown, extra: Catalog): Catalog {
  const out: Catalog = isRecord(base) ? (base as Catalog) : {};
  for (const [key, value] of Object.entries(extra)) {
    const current: unknown = out[key];
    out[key] = isRecord(current) && isRecord(value) ? deepMerge(current, value as Catalog) : value;
  }
  return out;
}

export interface I18nOptions {
  defaultLocale: string;
  catalogs: Record<string, Catalog>;
}

/**
 * Localizable string service. Lookup is dot-notation with {named}
 * interpolation; plurals use the platform Intl.PluralRules (no library).
 * Missing keys fall back to the key itself so the UI never blanks.
 */
export class I18nService {
  private readonly catalogs: Record<string, Catalog>;
  private readonly namespaces = new Set<string>();
  private locale_: string;
  private readonly listeners = new Set<() => void>();
  private readonly warned = new Set<string>();

  constructor(options: I18nOptions) {
    if (!isRecord(options.catalogs[options.defaultLocale])) {
      throw new Error(`Unknown default locale "${options.defaultLocale}"`);
    }
    this.catalogs = options.catalogs;
    this.locale_ = options.defaultLocale;
  }

  get locale(): string {
    return this.locale_;
  }

  locales(): string[] {
    return Object.keys(this.catalogs);
  }

  setLocale(locale: string): void {
    if (!isRecord(this.catalogs[locale])) {
      throw new Error(
        `Unknown locale "${locale}". Available: ${this.locales().join(", ")}`,
      );
    }
    if (locale === this.locale_) return;
    this.locale_ = locale;
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  getSnapshot = (): string => this.locale_;

  /**
   * Add a plugin's strings under its id namespace for an existing locale
   * (used as t("taskpig.myplugin.greeting")). Plugins register at
   * activate-time. New locales are introduced deliberately through the core
   * catalog first, so unknown locales throw instead of silently forking
   * the UI language.
   */
  registerStrings(pluginId: string, locale: string, strings: Catalog): void {
    if (typeof pluginId !== "string" || pluginId.length === 0) {
      throw new Error("registerStrings() needs a non-empty plugin id");
    }
    const catalog = this.catalogs[locale];
    if (!isRecord(catalog)) {
      throw new Error(`Unknown locale "${locale}". Available: ${this.locales().join(", ")}`);
    }
    catalog[pluginId] = deepMerge(catalog[pluginId], strings);
    this.namespaces.add(pluginId);
  }

  t(key: string, vars: InterpVars = {}): string {
    const value = this.resolve(key);
    if (typeof value !== "string") {
      this.warnOnce(key);
      return key;
    }
    return interpolate(value, vars);
  }

  count(key: string, n: number, vars: InterpVars = {}): string {
    const value = this.resolve(key);
    if (typeof value === "string") return interpolate(value, { ...vars, count: n });
    if (!isPluralForms(value)) {
      this.warnOnce(key);
      return key;
    }
    const category = new Intl.PluralRules(this.locale_).select(n);
    return interpolate(value[category] ?? value.other, { ...vars, count: n });
  }

  /**
   * Plugin ids contain dots, so plain dot-walking cannot tell namespaces
   * from nesting. Longest registered namespace wins; otherwise walk the
   * core catalog from the root.
   */
  private resolve(key: string): CatalogValue | undefined {
    const catalog = this.catalogs[this.locale_] as Catalog;
    let match = "";
    for (const ns of this.namespaces) {
      if ((key === ns || key.startsWith(`${ns}.`)) && ns.length > match.length) {
        match = ns;
      }
    }
    if (match === "") return lookup(catalog, key);
    const node = catalog[match];
    const rest = key.slice(match.length).replace(/^\./, "");
    if (rest === "") return node;
    return isRecord(node) ? lookup(node as Catalog, rest) : undefined;
  }

  private warnOnce(key: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    console.warn(`[i18n] Missing key "${key}" for locale "${this.locale_}"`);
  }
}
