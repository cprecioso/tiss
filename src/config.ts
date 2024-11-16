import pathUtils from "node:path";
import { fileURLToPath } from "url";
import * as z from "zod";

const pathSchema = () =>
  z.union([
    z.instanceof(URL).transform((url) => fileURLToPath(url)),
    z
      .string()
      .url()
      .startsWith("file:")
      .transform((url) => fileURLToPath(url)),
    z.string().transform((path) => pathUtils.normalize(path)),
  ]);

const ensureOutputIsAllowedInput = <Schema extends z.ZodTypeAny>(
  schema: z.output<Schema> extends z.input<Schema> ? Schema : never,
) => schema;

export const makeConfigSchema = ({ root }: { root: string }) => {
  const configPath = pathSchema().transform((path) =>
    pathUtils.resolve(root, path),
  );

  return ensureOutputIsAllowedInput(
    z.object({
      base: configPath.default(root),
      dynamicExtensions: z
        .string()
        .startsWith(".")
        .array()
        .default([".ts", ".js", ".tsx", ".jsx"]),
    }),
  );
};

type ConfigSchema = ReturnType<typeof makeConfigSchema>;
export type Config = z.output<ConfigSchema>;
export type ConfigInput = z.input<ConfigSchema>;
