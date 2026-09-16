import { useState } from "react";
import type { LoadedPlugins, PluginModule } from "@taskpig/plugin-sdk";
import { Slot } from "@taskpig/plugin-sdk/react";
import { useT } from "@taskpig/plugin-i18n/react";
import type { JSX } from "react";
import {
  buildPluginTree,
  loadDisabledIds,
  saveDisabledIds,
  toggleDisabled,
  type PluginTreeRow,
} from "../plugin-state";
import { bundledPlugins, CORE_REQUIRED_PLUGINS } from "../plugins";

export function SettingsView({ loaded }: { loaded: LoadedPlugins }): JSX.Element {
  const t = useT();
  const { context, order } = loaded;
  const [disabled, setDisabled] = useState<string[]>(() => loadDisabledIds());
  const [blocked, setBlocked] = useState<string[]>([]);
  const rows = buildPluginTree(order);
  const loadedIds = new Set(order.map((plugin) => plugin.manifest.id));
  const parked = bundledPlugins.filter((plugin) => !loadedIds.has(plugin.manifest.id));

  const displayName = (plugin: PluginModule): string => {
    const key = plugin.manifest.displayNameKey;
    return key ? t.t(key) : plugin.manifest.id;
  };

  const onToggle = (id: string): void => {
    const result = toggleDisabled(disabled, id, order, CORE_REQUIRED_PLUGINS);
    if (!result.ok) {
      setBlocked(result.blockedBy);
      return;
    }
    setBlocked([]);
    setDisabled(result.disabled);
    saveDisabledIds(result.disabled);
    window.location.reload();
  };

  const renderRow = (row: PluginTreeRow, keySuffix: string): JSX.Element => {
    const { plugin, depth } = row;
    const { id, version, author } = plugin.manifest;
    const required = CORE_REQUIRED_PLUGINS.includes(id);
    const enabled = required || !disabled.includes(id);
    const name = displayName(plugin);
    return (
      <tr key={`${id}#${keySuffix}`}>
        <td>
          <input
            type="checkbox"
            checked={enabled}
            disabled={required}
            onChange={() => onToggle(id)}
            aria-label={t.t("settings.toggleAria", { name })}
            title={required ? t.t("settings.requiredNote") : undefined}
          />
        </td>
        <td style={{ paddingLeft: `${0.5 + depth * 1.5}rem` }}>{name}</td>
        <td>{author ?? ""}</td>
        <td>
          <code>{id}</code>
        </td>
        <td>{`v${version}`}</td>
      </tr>
    );
  };

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
      {blocked.length > 0 && (
        <p role="alert">
          {t.t("settings.cannotDisable", {
            names: blocked
              .map((bid) => {
                const found = bundledPlugins.find((p) => p.manifest.id === bid);
                return found ? displayName(found) : bid;
              })
              .join(", "),
          })}
        </p>
      )}
      <table className="plugin-table">
        <thead>
          <tr>
            <th scope="col">{t.t("settings.col.enabled")}</th>
            <th scope="col">{t.t("settings.col.name")}</th>
            <th scope="col">{t.t("settings.col.author")}</th>
            <th scope="col">{t.t("settings.col.package")}</th>
            <th scope="col">{t.t("settings.col.version")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => renderRow(row, `tree-${index}`))}
          {parked.map((plugin) => renderRow({ plugin, depth: 0 }, "parked"))}
        </tbody>
      </table>
      <Slot name="settings.sections" slots={context.slots} />
    </section>
  );
}
