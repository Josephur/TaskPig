# 0004 — Minimal hand-rolled version ranges

- Status: accepted
- Date: 2026-09-16

## Context

Plugin manifests declare `requires: [{ id, version }]`. Options were the
`semver` package vs a minimal matcher.

## Decision

Hand-rolled `satisfies()`: `*`, exact versions, and caret ranges with
standard `0.x` semantics, fully unit-tested. Plugin needs are small and the
logic stays readable.

## Consequences

- One less dependency in the SDK's critical path.
- Adopt the `semver` package if ranges ever need tildes, hyphen ranges, or
  prerelease handling.
