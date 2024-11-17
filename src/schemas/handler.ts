import * as z from "zod";
import { someBufferSchema } from "../util/buf";
import { jsonSchema, maybeFunction, maybePromise } from "../util/zod";

export const handlerResultSchema = z.union([
  z.undefined(),
  z.string(),
  someBufferSchema,
  jsonSchema,
]);

export const handlerSchema = maybeFunction(maybePromise(handlerResultSchema));

export type Handler = z.output<typeof handlerSchema>;
export type HandlerInput = z.input<typeof handlerSchema>;
