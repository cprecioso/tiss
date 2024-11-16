import consola from "consola";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import * as yazl from "yazl";
import { build } from "../lib/build";
import { BaseActionCommand } from "./_base";

export class ArchiveCommand extends BaseActionCommand {
  static paths = [["archive"]];

  async execute() {
    const config = await this.getConfig();

    const zip = new yazl.ZipFile();

    await build(config, async ({ file, contents }) => {
      consola.info("Archiving", file);
      zip.addBuffer(
        Buffer.from(contents.buffer, contents.byteOffset, contents.byteLength),
        file,
        {},
      );
    });

    zip.end();

    await pipeline(
      zip.outputStream,
      fs.createWriteStream(config.archive.outFile),
    );

    consola.info("Finished writing archive at", config.archive.outFile);
  }
}
