import { Builtins, CommandClass } from "clipanion";
import { BuildCommand } from "./build";

export const commands: CommandClass[] = [
  BuildCommand,
  Builtins.HelpCommand,
  Builtins.VersionCommand,
];
