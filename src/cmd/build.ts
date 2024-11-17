import { Command } from "clipanion";
import consola from "consola";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import { build } from "../lib/build";
import { BaseActionCommand } from "./_base";

export class BuildCommand extends BaseActionCommand {
  static paths = [["build"]];

  static usage = Command.Usage({
    description: "Build the website",
  });

  async execute() {
    const config = await this.getConfig();

    if (config.build.clean) {
      consola.info("Cleaning", config.build.outDir);
      await fs.rm(config.build.outDir, { force: true, recursive: true });
    }

    await build(config, async ({ path }, contents) => {
      const outPath = pathUtils.resolve(config.build.outDir, path);
      consola.info("Writing", path);
      await fs.mkdir(pathUtils.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, contents);
    });

    consola.info("Finished writing site at", config.build.outDir);
  }
}
