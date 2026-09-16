# 0006 — Hand-rolled JSX literal check, not eslint jsx-no-literals

- Status: accepted
- Date: 2026-09-16

## Context

CI must fail on hard-coded UI strings. The standard tool,
`eslint-plugin-react`'s `jsx-no-literals`, needs the ESLint + TypeScript-ESLint
stack — but `@typescript-eslint/parser` is peer-capped below TypeScript 7 and
`eslint-plugin-react` is peer-capped below ESLint 10, while this repo tracks
latest stable (TS 7, ESLint 10).

## Decision

`scripts/check-i18n.mjs`: a Babel-parser-based scan for non-empty JSX text,
with its own Node-test coverage and an `i18n:allow-literal` marker for rare
reviewed exemptions. Attribute strings stay review-enforced (documented in
the script header).

## Consequences

- No peer-conflict downgrades; the check does exactly what the policy says.
- Revisit `jsx-no-literals` if the ecosystem catches up and we want broader
  lint rules — the marker comments map 1:1 to eslint-disable comments.
