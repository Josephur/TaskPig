# 0002 — Hand-rolled hash router

- Status: accepted
- Date: 2026-09-16

## Context

The shell needs a few top-level views (tasks, settings, not-found). Options
were React Router vs a minimal router.

## Decision

Hand-rolled hash router (`src/router.ts`, ~40 lines with tests). Hashes work
on every Tauri target without a fallback server, which history routing would
need. React Router stays an option if routing needs outgrow this.

## Consequences

- Zero routing dependencies; the whole router fits in one readable file.
- Plugin-contributed routes are a future design, not a Phase 1 feature.
