import type { PluginContext } from "@taskpig/plugin-sdk";
import { Slot } from "@taskpig/plugin-sdk/react";
import { useT } from "@taskpig/plugin-i18n/react";
import type { JSX } from "react";

export function TasksView({ context }: { context: PluginContext }): JSX.Element {
  const t = useT();
  return (
    <section aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">{t.t("tasks.title")}</h2>
      <div className="empty">
        <h3>{t.t("tasks.noProviderTitle")}</h3>
        <p>{t.t("tasks.noProviderBody")}</p>
      </div>
      <Slot name="tasks.sidebar" slots={context.slots} />
    </section>
  );
}
