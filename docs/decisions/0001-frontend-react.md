# 0001 — React for the frontend

- Status: accepted
- Date: 2026-09-16

## Context

Tauri accepts any framework compiling to HTML/JS/CSS. Candidates were React,
Svelte, Vue (all scaffold-supported), with SolidJS noted.

## Decision

React + Vite + TypeScript. Chosen for maturity and the volume of examples —
especially for dynamic UI composition, which the plugin-slot model relies on —
not for any Tauri requirement. Confirmed by the project owner after comparing
weight (React ships ~3x the starter JS of Svelte, ~150 KB, imperceptible at
this app's scale) and learnability.

## Consequences

- Largest ecosystem for components, patterns, and contributors.
- Heavier starter bundle than Svelte; revisit only if low-end Android startup
  proves to be a problem.
