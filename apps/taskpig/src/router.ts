import { useEffect, useState } from "react";

export type Route = "tasks" | "settings" | "notfound";

/**
 * Minimal hash router. Hashes (not history) because Tauri serves the app
 * without a fallback server on any platform.
 */
export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "");
  if (path === "" || path === "/") return "tasks";
  if (path === "/settings" || path === "/settings/") return "settings";
  return "notfound";
}

export function routeHref(route: Exclude<Route, "notfound">): string {
  return route === "tasks" ? "#/" : "#/settings";
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = (): void => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
