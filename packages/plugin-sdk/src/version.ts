import { PluginError } from "./errors.js";

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

const VERSION_RE = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseVersion(version: string): ParsedVersion {
  const match = VERSION_RE.exec(version.trim());
  if (!match) {
    throw new PluginError(
      "invalid-manifest",
      `Invalid version "${version}": expected MAJOR.MINOR.PATCH`,
    );
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/**
 * Minimal range support, intentionally small (see ADR 0004):
 * "*" (any), an exact "1.2.3", or a caret range "^1.2.3"
 * with standard 0.x caret semantics.
 */
export function satisfies(version: string, range: string): boolean {
  const want = range.trim();
  if (want === "*" || want === "") return true;
  if (!want.startsWith("^")) return version.trim() === want;

  const min = parseVersion(want.slice(1));
  const have = parseVersion(version);
  if (have.major !== min.major) return false;
  if (min.major === 0) {
    if (have.minor !== min.minor) return false;
    if (min.minor === 0) return have.patch === min.patch;
    return have.patch >= min.patch;
  }
  if (have.minor < min.minor) return false;
  if (have.minor === min.minor && have.patch < min.patch) return false;
  return true;
}
