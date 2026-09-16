import { PluginError } from "./errors.js";

export interface Command {
  id: string;
  /** Display title; a function keeps it localizable (resolved at render time). */
  title: string | (() => string);
  run: (args?: unknown) => unknown | Promise<unknown>;
}

export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  registerCommand(command: Command): void {
    if (this.commands.has(command.id)) {
      throw new PluginError("duplicate-command", `Command "${command.id}" is already registered`);
    }
    this.commands.set(command.id, command);
  }

  has(id: string): boolean {
    return this.commands.has(id);
  }

  getCommand(id: string): Command {
    const command = this.commands.get(id);
    if (!command) {
      throw new PluginError("unknown-command", `Unknown command "${id}"`);
    }
    return command;
  }

  listCommands(): Command[] {
    return [...this.commands.values()];
  }

  resolveTitle(command: Command): string {
    return typeof command.title === "function" ? command.title() : command.title;
  }

  async execute(id: string, args?: unknown): Promise<unknown> {
    return await this.getCommand(id).run(args);
  }
}
