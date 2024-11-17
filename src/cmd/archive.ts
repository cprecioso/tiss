import { Command } from "clipanion";
import consola from "consola";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import * as yazl from "yazl";
import { build } from "../lib/build";
import { BaseActionCommand } from "./_base";

export class ArchiveCommand extends BaseActionCommand {
  static paths = [["archive"]];

  static usage = Command.Usage({
    description: "Build the website and archive it in a zip",
  });

  async execute() {
    const config = await this.getConfig();

    const zip = new yazl.ZipFile();

    await build(config, async ({ path }, contents) => {
      consola.info("Archiving", path);

      if (Buffer.isBuffer(contents)) {
        zip.addBuffer(contents, path);
      } else {
        zip.addReadStream(contents, path);
      }
    });

    zip.end();

    await pipeline(
      zip.outputStream,
      fs.createWriteStream(config.archive.outFile),
    );

    consola.info("Finished writing archive at", config.archive.outFile);
  }
}
