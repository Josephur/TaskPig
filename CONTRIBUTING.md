# Contributing to TaskPig

## Setup

```sh
cd apps/taskpig
npm install
npm run tauri dev
```

If `tauri dev` complains about missing system libraries, run
`npx tauri info` in `apps/taskpig` and install what it reports.

## Issues

Use the issue templates so labels are applied automatically:

- **Feature request** (`feature-request` label): new features and enhancements.
  Roadmap phases additionally carry `phase-0` … `phase-7` labels.
- **Bug report** (`bug` label): anything broken. Include OS, desktop/Android,
  app version, repro steps, and logs.

## Pull requests

- Keep PRs small and scoped to one issue when possible.
- Add or update tests for behavior changes (SDK unit tests, frontend tests,
  `cargo test` — whichever covers your change).
- No hard-coded user-visible strings: everything renders through the
  Localization plugin API (Phase 1+). English is just the default catalog.
- Core owns the default task view. Plugins may add side panels, row actions,
  commands, and settings pages — never replace core routes.
- Core must stay free of provider-specific logic (no Google- or vendor-specific
  task code outside its plugin) and vendor SDKs.

## Plugin-first rules (short version)

1. New capability? Prefer a new plugin over core code.
2. Plugin needs another plugin? Declare it in `requires`, fail with a clear
   message when absent — never silently degrade.
3. Secrets and tokens stay in the OS-provided credential store, never in plain
   files, and never leave the device except to the provider's own API.
