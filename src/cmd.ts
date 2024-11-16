import { Command } from "@cliffy/command";
import consola from "consola";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pkg from "../package.json" with { type: "json" };
import { build } from "./lib/build";
import { getConfig } from "./lib/config";

export const cmd = new Command()
  .name(pkg.name)
  .version(pkg.version)

  .command("build")
  .option("-r,--root <path:file>", "Root path with the config file", {
    default: process.cwd(),
  })
  .action(async ({ root }) => {
    const config = await getConfig({ root });

    if (config.build.clean) {
      consola.info("Cleaning", config.build.outDir);
      await fs.rm(config.build.outDir, { force: true, recursive: true });
    }
    await fs.mkdir(config.build.outDir, { recursive: true });

    await build(config, async ({ file, contents }) => {
      const outPath = path.resolve(config.build.outDir, file);
      consola.info("Writing", file);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, contents);
    });

    consola.info("Finished writing site at", config.build.outDir);
  });
