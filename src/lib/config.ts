import consola from "consola";
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeConfigSchema } from "../schemas/config";

const jiti = createJiti(import.meta.url);

export const getConfig = async ({ root }: { root: string }) => {
  const configFile = path.resolve(root, "app.config");
  const configFileResolved = fileURLToPath(jiti.esmResolve(configFile));
  consola.info("Config file found at", configFileResolved);

  consola.info("Loading and parsing config file");
  const rawConfig = await jiti.import(configFile, { default: true });
  const configSchema = makeConfigSchema({ root });
  const config = await configSchema.parseAsync(rawConfig);

  consola.trace("Resolved config", config);

  return config;
};
