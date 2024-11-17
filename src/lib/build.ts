import consola from "consola";
import { fdir } from "fdir";
import { createReadStream } from "node:fs";
import pathUtils from "node:path";
import pMap from "p-map";
import { Config } from "../schemas/config";
import { isSomeBuffer, toNodeBuffer } from "../util/buf";

export interface Entry {
  path: string;
  isDynamic: boolean;
  inputFile: string;
}

export type Contents = Buffer | NodeJS.ReadableStream;

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

export const getContents = async (
  config: Config,
  entry: Entry,
): Promise<Contents> => {
  consola.info("Processing file", entry.path);

  if (entry.isDynamic) {
    const handler = await config.dynamic.importer(entry.inputFile);

    const result = typeof handler === "function" ? await handler() : handler;

    if (typeof result === "string") return Buffer.from(result);
    else if (isSomeBuffer(result)) return toNodeBuffer(result);
    else return Buffer.from(`${JSON.stringify(result)}\n`);
  } else {
    return createReadStream(entry.inputFile);
  }
};

export const build = async (
  config: Config,
  handler: (entry: Entry, contents: Contents) => Promise<void>,
) => {
  consola.info("Crawling", config.base);

  const files = await findEntries(config);

  return pMap(
    files,
    async (entry) => {
      const contents = await getContents(config, entry);
      return handler(entry, contents);
    },
    { concurrency: config.dynamic.concurrency },
  );
};
