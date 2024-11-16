import { Command } from "clipanion";
import consola from "consola";
import fs from "node:fs/promises";
import path from "node:path";
import { build } from "../lib/build";
import { BaseActionCommand } from "./_base";

export class BuildCommand extends BaseActionCommand {
  static paths = [Command.Default, ["build"]];

  async execute() {
    const config = await this.getConfig();

    if (config.build.clean) {
      consola.info("Cleaning", config.build.outDir);
      await fs.rm(config.build.outDir, { force: true, recursive: true });
    }

    await build(config, async ({ file, contents }) => {
      const outPath = path.resolve(config.build.outDir, file);
      consola.info("Writing", file);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, contents);
    });

    consola.info("Finished writing site at", config.build.outDir);
  }
}
