# 0007 — Plugin enable/disable semantics

- Status: accepted
- Date: 2026-09-16

## Context

Settings needs an enable/disable matrix (Enabled, Name, Author, Package,
Version) with nested dependency display.

## Decision

- Disabled IDs persist in localStorage; boot filters them, required IDs
  always surviving (defense against hand-edited storage).
- Disabling is blocked while an enabled plugin `requires` the id; the UI
  names the blockers. No cascading.
- Toggles apply via page reload — no runtime unload machinery in Phase 1.
- The matrix nests each plugin's `requires` beneath it, npm-ls style
  (shared deps repeat under each parent).
- Kept the manifest field name `requires` (standard term, already implemented
  and loader-enforced) instead of adding a `dependsOn` alias.

## Consequences

- Predictable, fully unit-tested behavior with zero unload machinery.
- Real unload flows and multi-provider aggregation stay future work.
