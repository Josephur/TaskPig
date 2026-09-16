export type InterpVars = Record<string, string | number>;

/** Plural templates keyed by Intl plural category; "other" is the required fallback. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export type CatalogValue = string | PluralForms | Catalog;

export interface Catalog {
  [key: string]: CatalogValue;
}
