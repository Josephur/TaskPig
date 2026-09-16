/** Machine-readable failure kinds for plugin loading and registry misuse. */
export type PluginErrorCode =
  | "invalid-manifest"
  | "duplicate-plugin"
  | "duplicate-service"
  | "duplicate-slot"
  | "duplicate-command"
  | "missing-dependency"
  | "version-mismatch"
  | "dependency-cycle"
  | "missing-required-plugin"
  | "unknown-slot"
  | "unknown-command";

export class PluginError extends Error {
  readonly code: PluginErrorCode;

  constructor(code: PluginErrorCode, message: string) {
    super(message);
    this.name = "PluginError";
    this.code = code;
  }
}
