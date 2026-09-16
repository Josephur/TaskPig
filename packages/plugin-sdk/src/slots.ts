import { PluginError } from "./errors.js";

export interface SlotContribution<P = Record<string, never>> {
  pluginId: string;
  /** Unique within the slot; combined with pluginId as the render key. */
  id: string;
  /** Framework-agnostic payload; the React entry point renders it as a node. */
  render: (props: P) => unknown;
}

/** Named extension points (e.g. "tasks.sidebar") filled by plugin contributions. */
export class SlotRegistry {
  private readonly slots = new Map<string, Array<SlotContribution<never>>>();

  defineSlot(name: string): void {
    if (this.slots.has(name)) {
      throw new PluginError("duplicate-slot", `Slot "${name}" is already defined`);
    }
    this.slots.set(name, []);
  }

  has(name: string): boolean {
    return this.slots.has(name);
  }

  contribute<P>(slot: string, contribution: SlotContribution<P>): void {
    const list = this.slots.get(slot);
    if (!list) {
      throw new PluginError(
        "unknown-slot",
        `Slot "${slot}" is not defined. Core defines slots before plugins activate.`,
      );
    }
    if (list.some((c) => c.pluginId === contribution.pluginId && c.id === contribution.id)) {
      throw new PluginError(
        "duplicate-slot",
        `Slot "${slot}" already has contribution "${contribution.pluginId}:${contribution.id}"`,
      );
    }
    list.push(contribution as SlotContribution<never>);
  }

  getContributions<P>(slot: string): ReadonlyArray<SlotContribution<P>> {
    const list = this.slots.get(slot);
    if (!list) {
      throw new PluginError("unknown-slot", `Slot "${slot}" is not defined`);
    }
    // Safe: props flow opaquely from the <Slot> caller to each render().
    return list as unknown as ReadonlyArray<SlotContribution<P>>;
  }
}
