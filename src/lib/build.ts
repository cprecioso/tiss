import consola from "consola";
import { fdir } from "fdir";
import fs from "node:fs/promises";
import path from "node:path";
import pMap from "p-map";
import { Config } from "../schemas/config";

export const buildFile = async (
  config: Config,
  file: string,
): Promise<{ file: string; contents: Uint8Array }> => {
  consola.info("Processing file", file);

  const inputPath = path.resolve(config.base, file);

  const isDynamic = config.input.isDynamic(inputPath);

  if (isDynamic) {
    const outName = config.dynamic.transformName(file);

    const handler = await config.dynamic.importer(inputPath);

    const result = typeof handler === "function" ? await handler() : handler;

    if (typeof result === "string") {
      return {
        file: outName,
        contents: new TextEncoder().encode(result),
      };
    } else if (result instanceof Uint8Array) {
      return {
        file: outName,
        contents: result,
      };
    } else {
      return {
        file: outName,
        contents: new TextEncoder().encode(JSON.stringify(result) + "\n"),
      };
    }
  } else {
    return {
      file,
      contents: await fs.readFile(inputPath),
    };
  }
};

export const build = async (
  config: Config,
  handler: (entry: { file: string; contents: Uint8Array }) => Promise<void>,
) => {
  consola.info("Crawling", config.base);

  const files = await new fdir()
    .withRelativePaths()
    .exclude(
      (path) => !config.input.include(path) || config.input.exclude(path),
    )
    .crawl(config.base)
    .withPromise();

  return pMap(
    files,
    async (inName) => {
      const entry = await buildFile(config, inName);
      return handler(entry);
    },
    { concurrency: config.dynamic.concurrency },
  );
};
