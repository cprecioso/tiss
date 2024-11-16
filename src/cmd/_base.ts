import { Command, Option } from "clipanion";
import consola from "consola";
import process from "node:process";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { getConfig } from "../lib/config";

export abstract class BaseCommand extends Command {
  async catch(error: any) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      consola.error(validationError.message);
    } else {
      consola.error(error);
    }

    process.exit(1);
  }
}

export abstract class BaseActionCommand extends BaseCommand {
  root = Option.String("-r,--root", process.cwd(), {
    description: "Root path with the config file",
  });

  getConfig() {
    return getConfig({ root: this.root });
  }
}
