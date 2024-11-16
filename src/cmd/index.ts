import { Builtins, CommandClass } from "clipanion";
import { ArchiveCommand } from "./archive";
import { BuildCommand } from "./build";

export const commands: CommandClass[] = [
  BuildCommand,
  ArchiveCommand,
  Builtins.HelpCommand,
  Builtins.VersionCommand,
];
