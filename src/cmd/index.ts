import { Builtins, CommandClass } from "clipanion";
import { ArchiveCommand } from "./archive";
import { BuildCommand } from "./build";
import { DevCommand } from "./dev";

export const commands: CommandClass[] = [
  DevCommand,
  BuildCommand,
  ArchiveCommand,
  Builtins.HelpCommand,
  Builtins.VersionCommand,
];
