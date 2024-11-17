import { Readable } from "node:stream";
import { Jsonifiable } from "type-fest";
import * as z from "zod";

export const jsonSchema = z.custom<Jsonifiable>();

export const readableStreamSchema = z.custom<Readable | NodeJS.ReadableStream>(
  (v) => Readable.isReadable(v),
);

export const maybeArray = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([z.array(schema), schema.transform<z.output<S>[]>((v) => [v])]);

export const maybePromise = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([z.promise(schema), schema]);

export const maybeThunk = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([
    z.function(z.tuple([]), schema),
    schema.transform<() => z.output<S>>((v) => () => v),
  ]);
