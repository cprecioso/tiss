import consola from "consola";
import { fdir } from "fdir";
import fs from "node:fs/promises";
import pathUtils from "node:path";
import pMap from "p-map";
import { Config } from "../schemas/config";

export interface Entry {
  path: string;
  isDynamic: boolean;
  inputFile: string;
}

export interface EntryWithContent extends Entry {
  contents: Uint8Array;
}

export const findEntries = async (config: Config): Promise<Entry[]> => {
  consola.info("Crawling", config.base);

  const files = await new fdir()
    .withRelativePaths()
    .filter(config.input.include)
    .exclude(config.input.exclude)
    .crawl(config.base)
    .withPromise();

  return files.map((file) => {
    const inputFile = pathUtils.resolve(config.base, file);

    const isDynamic = config.input.isDynamic(inputFile);
    const path = isDynamic ? config.dynamic.transformName(file) : file;

    return {
      path,
      isDynamic,
      inputFile,
    };
  });
};

export const getEntryContent = async (
  config: Config,
  entry: Entry,
): Promise<EntryWithContent> => {
  consola.info("Processing file", entry.path);

  const filename = pathUtils.basename(entry.path);

  if (entry.isDynamic) {
    const handler = await config.dynamic.importer(entry.inputFile);

    const result = typeof handler === "function" ? await handler() : handler;

    if (typeof result === "string") {
      return {
        ...entry,
        contents: new TextEncoder().encode(result),
      };
    } else if (result instanceof Uint8Array) {
      return {
        ...entry,
        contents: result,
      };
    } else {
      return {
        ...entry,
        contents: new TextEncoder().encode(`${JSON.stringify(result)}\n`),
      };
    }
  } else {
    return {
      ...entry,
      contents: await fs.readFile(entry.inputFile),
    };
  }
};

export const build = async (
  config: Config,
  handler: (entry: EntryWithContent) => Promise<void>,
) => {
  consola.info("Crawling", config.base);

  const files = await findEntries(config);

  return pMap(
    files,
    async (entry) => {
      const entryWithContent = await getEntryContent(config, entry);
      return handler(entryWithContent);
    },
    { concurrency: config.dynamic.concurrency },
  );
};
