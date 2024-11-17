import { Readable } from "node:stream";
import * as z from "zod";
import { someBufferSchema, toNodeBuffer } from "../util/buf";
import {
  jsonSchema,
  maybePromise,
  maybeThunk,
  readableStreamSchema,
} from "../util/zod";

export const handlerResultSchema = z.union([
  z.string().transform((v) => Buffer.from(v, "utf8")),
  someBufferSchema.transform((v) => toNodeBuffer(v)),
  readableStreamSchema.transform((v) => Readable.from(v)),
  jsonSchema.transform((v) => Buffer.from(`${JSON.stringify(v)}\n`)),
]);

export type HandlerResult = z.output<typeof handlerResultSchema>;
export type HandlerResultInput = z.input<typeof handlerResultSchema>;

export const handlerSchema = maybeThunk(maybePromise(handlerResultSchema));

export type Handler = z.output<typeof handlerSchema>;
export type HandlerInput = z.input<typeof handlerSchema>;
