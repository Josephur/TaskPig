# TaskPig

TaskPig is a cross-platform tasks client built with Tauri v2. Its core job is
displaying your tasks in full detail and reminding you about them — and it is
designed plugin-first from the ground up: task-list providers, accounts, AI
scheduling, AI providers, and localization are all plugins.

Google Tasks is the bundled default task-list provider plugin. Other task-list
providers can be added later as plugins, without touching core.

**Privacy model:** TaskPig operates no servers. Google and AI-provider calls go
directly from your device, and tokens live only in your OS-provided credential
store. See [SECURITY.md](SECURITY.md).

> Status: Phase 0 scaffold. The app builds and runs the Tauri starter window;
> task features land per the roadmap tracker issue.

## Layout

```text
TaskPig/
  apps/taskpig/            # the Tauri app: frontend (React + TS + Vite) + src-tauri (Rust)
  packages/plugin-sdk/     # plugin manifest schema, registry, test harness (Phase 1)
  plugins/                 # account-google, provider-google-tasks, i18n, ... (Phases 1+)
  docs/                    # architecture, plugin-authoring, auth-setup (per phase)
  .github/workflows/       # CI
```

## Prerequisites

- Node.js 22+ with npm
- Rust stable toolchain with cargo
- Linux: Tauri WebView system libraries. Run the command below and follow what
  `tauri info` reports as missing:
  `cd apps/taskpig && npx tauri info`

## Quickstart

```sh
cd apps/taskpig
npm install
npm run tauri dev        # desktop development (Linux / Windows)
```

Android (Phase 6 wires up OAuth; the scaffold commands already exist):

```sh
cd apps/taskpig
npm run tauri android init
npm run tauri android dev
```

App scripts (`apps/taskpig/package.json`): `dev` (Vite only), `build`
(typecheck + Vite build), `preview`, `tauri` (Tauri CLI passthrough).

## Issues & contributions

- Feature proposals are filed as **Feature Requests** (`feature-request` label).
- Bugs are filed as **Bug Reports** (`bug` label).
- Roadmap work carries `phase-0` … `phase-7` labels.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions, and the
plugin-first rules (including: no hard-coded UI strings — everything renders
through the Localization plugin once Phase 1 lands).

## License

MIT — see [LICENSE](LICENSE). Use it however you like, just keep the
copyright notice.
