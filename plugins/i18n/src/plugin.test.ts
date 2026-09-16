import { loadTestPlugins } from "@taskpig/plugin-sdk";
import { describe, expect, it } from "vitest";
import { I18N_SERVICE_KEY, i18nPlugin } from "./plugin.js";
import type { I18nService } from "./service.js";

describe("i18nPlugin", () => {
  it("provides a working i18n service", async () => {
    const { context } = await loadTestPlugins([i18nPlugin]);
    const i18n = context.services.require<I18nService>(I18N_SERVICE_KEY);
    expect(i18n.locale).toBe("en");
    expect(i18n.t("nav.settings")).toBe("Settings");
  });

  it("satisfies core's required-plugin gate", async () => {
    await expect(
      loadTestPlugins([i18nPlugin], { requiredIds: ["taskpig.i18n"] }),
    ).resolves.toBeDefined();
    await expect(loadTestPlugins([], { requiredIds: ["taskpig.i18n"] })).rejects.toMatchObject({
      code: "missing-required-plugin",
    });
  });
});
