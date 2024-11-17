import { lookup as lookupMimeType } from "mrmime";
import { createServer as nodeCreateServer } from "node:http";
import { pipeline } from "node:stream/promises";
import { joinURL, parsePath as parseUrlPath } from "ufo";
import { Config } from "../schemas/config";
import { Entry, getContents } from "./build";

export const createServer = (config: Config, entries: readonly Entry[]) => {
  const entriesByPath = new Map(
    entries.map((entry) => [`/${entry.path}`, entry]),
  );

  const findEntry = (path: string) => {
    const entry = entriesByPath.get(path);
    if (entry) return entry;

    for (const indexFile of config.dev.indexFiles) {
      const possiblePath = joinURL(path, `/${indexFile}`);
      const entry = entriesByPath.get(possiblePath);
      if (entry) return entry;
    }
  };

  const server = nodeCreateServer(async (req, res) => {
    const { pathname } = parseUrlPath(req.url);

    const entry = findEntry(pathname);

    if (!entry) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    const contents = await getContents(config, entry);
    const mimetype = lookupMimeType(entry.path);

    if (mimetype) res.setHeader("Content-Type", mimetype);

    if (Buffer.isBuffer(contents)) {
      res.write(contents);
      res.end();
    } else {
      await pipeline(contents, res);
    }
  });

  return server;
};
