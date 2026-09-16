# 0005 — Vitest + Testing Library + jsdom for TS tests

- Status: accepted
- Date: 2026-09-16

## Context

The SDK, plugins, and app shell all need unit/component tests.

## Decision

Vitest (`vitest run` in CI) with Testing Library and jsdom for component
tests. Vite-native, standard API, per-file jsdom opt-in via
`@vitest-environment`. Repo scripts (`scripts/`) use the zero-dependency
Node test runner instead.

## Consequences

- `npm test` runs every workspace suite; `test:watch` for development.
- React component tests clean up explicitly (`afterEach(cleanup)`) since
  Vitest globals are off.
