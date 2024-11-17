import { Command } from "clipanion";
import consola from "consola";
import { lookup as lookupMimeType } from "mrmime";
import { createServer } from "node:http";
import { joinURL, parsePath as parseUrlPath } from "ufo";
import { findEntries, getEntryContent } from "../lib/build";
import { BaseActionCommand } from "./_base";

export class DevCommand extends BaseActionCommand {
  static paths = [["dev"], Command.Default];

  static usage = Command.Usage({
    description: "Serve the website",
  });

  async execute() {
    const config = await this.getConfig();

    const entries = await findEntries(config);

    const entriesByPath = new Map(
      entries.map((entry) => ["/" + entry.path, entry]),
    );

    const server = createServer(async (req, res) => {
      const { pathname } = parseUrlPath(req.url);

      let entry = entriesByPath.get(pathname);

      if (!entry) {
        for (const indexFile of config.dev.indexFiles) {
          const possiblePath = joinURL(pathname, `/${indexFile}`);
          entry = entriesByPath.get(possiblePath);
          if (entry) break;
        }
      }

      if (!entry) {
        res.statusCode = 404;
        res.end("Not Found");
        return;
      }

      const { contents } = await getEntryContent(config, entry);
      const mimetype = lookupMimeType(pathname);

      if (mimetype) res.setHeader("Content-Type", mimetype);
      res.write(contents);
      res.end();
    });

    server.listen(config.dev.port, config.dev.hostname, undefined, () => {
      consola.info(
        "Listening on",
        `http://${config.dev.hostname}:${config.dev.port}/`,
      );
    });

    return;
  }
}
