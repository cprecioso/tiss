import { Command } from "clipanion";
import consola from "consola";
import { findEntries } from "../lib/build";
import { createServer } from "../lib/serve";
import { BaseActionCommand } from "./_base";

export class DevCommand extends BaseActionCommand {
  static paths = [["dev"], Command.Default];

  static usage = Command.Usage({
    description: "Serve the website",
  });

  async execute() {
    const config = await this.getConfig();

    const entries = await findEntries(config);

    const server = createServer(config, entries);

    server.listen(config.dev.port, config.dev.hostname, undefined, () => {
      consola.info(
        "Listening on",
        `http://${config.dev.hostname}:${config.dev.port}/`,
      );
    });

    return;
  }
}
