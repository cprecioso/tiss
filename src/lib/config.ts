import consola from "consola";
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Config, ConfigInput, makeConfigSchema } from "../schemas/config";

const jiti = createJiti(import.meta.url);

const getRawConfig = async (
  configFile: string | undefined,
): Promise<ConfigInput> => {
  if (!configFile) {
    consola.info("No config file found, using default config");
    return undefined;
  }

  const configFileResolved = fileURLToPath(configFile);
  consola.info("Config file found at", configFileResolved);

  consola.info("Loading and parsing config file");
  return await jiti.import(configFileResolved, { default: true });
};

export const getConfig = async ({
  root,
}: {
  root: string;
}): Promise<Config> => {
  const configFile = jiti.esmResolve(path.resolve(root, "app.config"), {
    try: true,
  });

  const rawConfig = await getRawConfig(configFile);

  const configSchema = makeConfigSchema({ root });
  const config = await configSchema.parseAsync(rawConfig);

  consola.trace("Resolved config", config);

  return config;
};
