# Writing a TaskPig plugin

TaskPig plugins are app-level TypeScript packages. A plugin is a manifest plus
an `activate()` function; core loads manifests, resolves `requires`, and calls
each `activate()` in dependency order.

## Minimal plugin

```ts
import type { PluginModule } from "@taskpig/plugin-sdk";

export const myPlugin: PluginModule = {
  manifest: {
    id: "taskpig.example.myplugin", // unique, dot-namespaced
    version: "0.1.0", // exact MAJOR.MINOR.PATCH
    displayNameKey: "plugins.myplugin.name", // i18n key, never a literal
    author: "Your Name", // shown as-is in Settings
    provides: ["example.thing"], // capabilities others can discover
    requires: [{ id: "taskpig.i18n", version: "^0.1.0" }], // dep or it won't load
  },
  activate: (ctx) => {
    ctx.services.provide("example.service", createService());
  },
};
```

Version ranges support `*`, exact versions, and caret ranges (`^1.2.3`,
with standard `0.x` caret semantics). Anything else fails manifest validation.

## What activate() can touch

- `ctx.services` — `provide(key, service)` / `require<T>(key)`. Shared
  singletons live here (the i18n service is `"i18n"`).
- `ctx.slots` — `contribute(slot, { pluginId, id, render })`. Slots are
  extension points core defines (`tasks.sidebar`, `settings.sections`); render
  them with `<Slot name="..." slots={ctx.slots} />` from
  `@taskpig/plugin-sdk/react`.
- `ctx.commands` — `registerCommand({ id, title, run })`. Use a `() => string`
  title so commands stay localizable.

There is deliberately no API for replacing core views or routes. If your
feature needs one, that is a core design discussion, not a plugin.

## Enabling, disabling, and dependencies

- Users toggle plugins in Settings (Enabled column). Toggles persist in
  browser storage and apply on next boot — the app reloads automatically.
- Disabling is blocked while an enabled plugin lists the id in `requires`
  (block, never surprise-cascade); the UI names the blockers. Required
  plugins (currently `taskpig.i18n`) cannot be disabled at all.
- `requires` is also how Settings nests the plugin tree: each plugin's
  requirements render indented beneath it.

## Strings and locales

- Every user-visible string goes through the i18n service: `t("area.key")`
  with `{named}` interpolation, `count("area.key", n)` for plurals.
- Never hard-code UI text — CI fails the build on JSX literals
  (`npm run lint`). The only exemption mechanism is an
  `i18n:allow-literal` marker comment with a reason, reviewed per use.
- Translating core = copying `plugins/i18n/src/catalogs/en.ts` to `xx.ts`
  and registering it. Keep keys, `{variables}`, and plural forms intact.

Plugins ship their own strings through the service (never a parallel lookup).
Require `taskpig.i18n` in your manifest, then register US English first:

```ts
// inside activate()
import type { I18nService } from "@taskpig/plugin-i18n";

const i18n = ctx.services.require<I18nService>("i18n");
i18n.registerStrings("taskpig.example.myplugin", "en", {
  greeting: "Hello, {name}!",
});
// used as t("taskpig.example.myplugin.greeting")
```

Your keys live under your plugin id — never at the catalog root, which core
owns. Boot warns for plugins that skip the i18n requirement. New locales are
introduced through the core catalog first (`registerStrings` throws for
unknown locales); per-key locale fallback is future work.

## Testing a plugin

```ts
import { loadTestPlugins, createTestContext } from "@taskpig/plugin-sdk";
```

Use `fakePlugin()` / `loadTestPlugins()` from the SDK for isolated loading
tests (missing deps, version mismatches, activation order). Run with
`npm run test --workspace=<your package>`.

## Bundled vs future plugins

Phase 1 loads bundled plugins from a static list (`apps/taskpig/src/plugins.ts`).
Folder-based discovery for third-party plugins lands with the first sideload
need; the loader already accepts any plugin list, so discovery is pluggable.
