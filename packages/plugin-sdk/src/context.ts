import { CommandRegistry } from "./commands.js";
import { ServiceRegistry } from "./services.js";
import { SlotRegistry } from "./slots.js";

/** What core hands every plugin at activation. Always created fresh — never a singleton. */
export interface PluginContext {
  readonly slots: SlotRegistry;
  readonly commands: CommandRegistry;
  readonly services: ServiceRegistry;
}

export function createPluginContext(): PluginContext {
  return {
    slots: new SlotRegistry(),
    commands: new CommandRegistry(),
    services: new ServiceRegistry(),
  };
}
