import { PluginError } from "./errors.js";
import { parseVersion } from "./version.js";
import type { PluginContext } from "./context.js";

export interface PluginRequirement {
  /** ID of the required plugin, e.g. "taskpig.agent". */
  id: string;
  /** Accepted versions: "*", an exact "1.2.3", or a caret range "^1.2.3". */
  version: string;
}

export interface PluginContributions {
  slots?: string[];
  commands?: string[];
}

export interface PluginManifest {
  id: string;
  /** Manifests pin exact MAJOR.MINOR.PATCH versions. */
  version: string;
  provides?: string[];
  requires?: PluginRequirement[];
  contributions?: PluginContributions;
}

export interface PluginModule {
  manifest: PluginManifest;
  activate: (ctx: PluginContext) => void | Promise<void>;
  deactivate?: (ctx: PluginContext) => void | Promise<void>;
}

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function checkRange(range: unknown): void {
  if (typeof range !== "string" || range.trim() === "") {
    throw new PluginError(
      "invalid-manifest",
      'Requirement "version" must be "*", an exact version, or a caret range',
    );
  }
  const raw = range.trim();
  if (raw !== "*") parseVersion(raw.startsWith("^") ? raw.slice(1) : raw);
}

export function validateManifest(manifest: unknown): PluginManifest {
  if (!isRecord(manifest)) {
    throw new PluginError("invalid-manifest", "Manifest must be an object");
  }
  const { id, version, provides, requires, contributions } = manifest;
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new PluginError(
      "invalid-manifest",
      `Manifest "id" must match ${ID_RE.source}`,
    );
  }
  if (typeof version !== "string") {
    throw new PluginError("invalid-manifest", 'Manifest "version" must be a string');
  }
  parseVersion(version);
  if (provides !== undefined && !isStringArray(provides)) {
    throw new PluginError("invalid-manifest", 'Manifest "provides" must be a string array');
  }
  let validatedRequires: PluginRequirement[] | undefined;
  if (requires !== undefined) {
    if (!Array.isArray(requires)) {
      throw new PluginError("invalid-manifest", 'Manifest "requires" must be an array');
    }
    validatedRequires = [];
    for (const req of requires) {
      if (!isRecord(req) || typeof req.id !== "string" || !ID_RE.test(req.id)) {
        throw new PluginError(
          "invalid-manifest",
          `Each requirement needs an { id } matching ${ID_RE.source}`,
        );
      }
      checkRange(req.version);
      validatedRequires.push({ id: req.id as string, version: req.version as string });
    }
  }
  const out: PluginManifest = { id, version };
  if (provides !== undefined) out.provides = provides;
  if (validatedRequires !== undefined) out.requires = validatedRequires;
  if (contributions !== undefined) {
    if (!isRecord(contributions)) {
      throw new PluginError("invalid-manifest", 'Manifest "contributions" must be an object');
    }
    const { slots, commands } = contributions;
    if (slots !== undefined && !isStringArray(slots)) {
      throw new PluginError(
        "invalid-manifest",
        'Manifest "contributions.slots" must be a string array',
      );
    }
    if (commands !== undefined && !isStringArray(commands)) {
      throw new PluginError(
        "invalid-manifest",
        'Manifest "contributions.commands" must be a string array',
      );
    }
    out.contributions = {};
    if (slots !== undefined) out.contributions.slots = slots;
    if (commands !== undefined) out.contributions.commands = commands;
  }
  return out;
}
