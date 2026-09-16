# 0003 — Hand-rolled i18n service, no library

- Status: accepted
- Date: 2026-09-16

## Context

All UI strings must render through the Localization plugin. Options were a
library (i18next and friends) vs a minimal service.

## Decision

Hand-rolled `I18nService`: dot-notation lookup, `{named}` interpolation, and
plurals via the platform `Intl.PluralRules` — no library. Catalogs are
TypeScript modules (typechecked) starting with `en.ts`; translating means
copying one file. React binding is a provider plus `useT()` on
`useSyncExternalStore`.

## Consequences

- Zero i18n dependencies; missing keys fall back to the key so the UI never blanks.
- Advanced ICU features (selectordinal messages, rich-text nesting) arrive only
  if a real catalog needs them.
