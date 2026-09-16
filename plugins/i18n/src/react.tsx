import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { I18nService } from "./service.js";

const I18nContext = createContext<I18nService | null>(null);

export function I18nProvider({
  service,
  children,
}: {
  service: I18nService;
  children: ReactNode;
}): ReactNode {
  return <I18nContext.Provider value={service}>{children}</I18nContext.Provider>;
}

/**
 * The i18n service. Each consumer subscribes itself so locale changes
 * re-render (a stable context value alone would not re-render consumers).
 */
export function useT(): I18nService {
  const service = useContext(I18nContext);
  if (!service) throw new Error("useT() must be used inside <I18nProvider>");
  useSyncExternalStore(service.subscribe, service.getSnapshot);
  return service;
}
