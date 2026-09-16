import type { LoadedPlugins } from "@taskpig/plugin-sdk";
import { Slot } from "@taskpig/plugin-sdk/react";
import { useT } from "@taskpig/plugin-i18n/react";
import type { JSX } from "react";

export function SettingsView({ loaded }: { loaded: LoadedPlugins }): JSX.Element {
  const t = useT();
  const { context, order } = loaded;
  return (
    <section aria-labelledby="settings-heading">
      <h2 id="settings-heading">{t.t("settings.title")}</h2>
      <label className="field">
        <span>{t.t("settings.languageLabel")}</span>
        <select value={t.locale} onChange={(event) => t.setLocale(event.currentTarget.value)}>
          {t.locales().map((locale) => (
            <option key={locale} value={locale}>
              {t.t(`settings.languageName_${locale}`)}
            </option>
          ))}
        </select>
      </label>
      <h3>{t.t("settings.pluginsTitle")}</h3>
      {order.length === 0 ? (
        <p>{t.t("settings.pluginsEmpty")}</p>
      ) : (
        <ul className="plugin-list">
          {order.map((plugin) => (
            <li key={plugin.manifest.id}>
              <PluginLabel
                id={plugin.manifest.id}
                version={plugin.manifest.version}
                displayNameKey={plugin.manifest.displayNameKey}
              />
            </li>
          ))}
        </ul>
      )}
      <Slot name="settings.sections" slots={context.slots} />
    </section>
  );
}

function PluginLabel({
  id,
  version,
  displayNameKey,
}: {
  id: string;
  version: string;
  displayNameKey?: string;
}): JSX.Element {
  const t = useT();
  if (!displayNameKey) return <code>{`${id} v${version}`}</code>;
  return (
    <span>{t.t("settings.pluginLabel", { name: t.t(displayNameKey), id, version })}</span>
  );
}
