# TaskPig app (Tauri v2 + React + TypeScript + Vite)

This is the main TaskPig application. Frontend lives in `src/`, the Rust core
in `src-tauri/`.

## Scripts

| Command                       | What it does                                   |
| ----------------------------- | ---------------------------------------------- |
| `npm install`                 | install frontend dependencies                  |
| `npm run dev`                 | Vite dev server only (no Tauri shell)          |
| `npm run build`               | typecheck (`tsc`) + production Vite build      |
| `npm run preview`             | preview the production build                   |
| `npm run tauri dev`           | desktop development (Linux / Windows)          |
| `npm run tauri android init`  | one-time Android project setup                 |
| `npm run tauri android dev`   | Android development on device/emulator         |
| `npx tauri info`              | environment report (use to diagnose missing system libraries) |

## Structure

```text
apps/taskpig/
  src/            # React frontend (routes, components, plugin slots in Phase 1+)
  src-tauri/      # Rust core (commands, capabilities/, tauri.conf.json)
  public/         # static assets
  index.html      # Vite entry
  vite.config.ts  # Vite + Tauri dev/build wiring
```

## Linux graphics troubleshooting

If the app exits immediately with a Wayland dispatch error
(`Gdk-Message: ... Error 71 (Protocol error) dispatching to Wayland display`),
run with WebKit compositing disabled until the underlying driver/compositor
issue is resolved:

```sh
WEBKIT_DISABLE_COMPOSITING_MODE=1 npm run tauri dev
```
