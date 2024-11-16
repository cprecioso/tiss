import { Command } from "@cliffy/command";
import consola from "consola";
import { createJiti } from "jiti";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pkg from "../package.json" with { type: "json" };
import { makeConfigSchema } from "./config";

const jiti = createJiti(import.meta.url);

export const cmd = new Command()
  .name(pkg.name)
  .version(pkg.version)

  .command("build")
  .option("-r,--root <path:file>", "Root path with the config file", {
    default: process.cwd(),
  })
  .action(async ({ root }) => {
    const configFile = path.resolve(root, "app.config");
    const configFileResolved = fileURLToPath(jiti.esmResolve(configFile));
    consola.info("Config file found at", configFileResolved);

    consola.info("Loading and parsing config file");
    const rawConfig = await jiti.import(configFile, { default: true });
    const configSchema = makeConfigSchema({ root });
    const parsedConfig = await configSchema.parseAsync(rawConfig);

    consola.trace("Resolved config", parsedConfig);
  });
