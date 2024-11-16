#!/usr/bin/env node

import consola from "consola";
import process from "node:process";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { cmd } from "./cmd";

try {
  await cmd.noExit().parse(process.argv.slice(2));
  process.exit(0);
} catch (error) {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    consola.error(validationError.message);
  } else {
    consola.error(error);
  }
  process.exit(1);
}
