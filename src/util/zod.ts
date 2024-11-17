import { Jsonifiable } from "type-fest";
import * as z from "zod";

export const jsonSchema = z.custom<Jsonifiable>();

export const maybeArray = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([z.array(schema), schema]);

export const maybePromise = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([z.promise(schema), schema]);

export const maybeFunction = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([z.function(z.tuple([]), schema), schema]);
