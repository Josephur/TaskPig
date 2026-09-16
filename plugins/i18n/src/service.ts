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

  t(key: string, vars: InterpVars = {}): string {
    const value = lookup(this.catalogs[this.locale_] as Catalog, key);
    if (typeof value !== "string") {
      this.warnOnce(key);
      return key;
    }
    return interpolate(value, vars);
  }

  count(key: string, n: number, vars: InterpVars = {}): string {
    const value = lookup(this.catalogs[this.locale_] as Catalog, key);
    if (typeof value === "string") return interpolate(value, { ...vars, count: n });
    if (!isPluralForms(value)) {
      this.warnOnce(key);
      return key;
    }
    const category = new Intl.PluralRules(this.locale_).select(n);
    return interpolate(value[category] ?? value.other, { ...vars, count: n });
  }

  private warnOnce(key: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    console.warn(`[i18n] Missing key "${key}" for locale "${this.locale_}"`);
  }
}
