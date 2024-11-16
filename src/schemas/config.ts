import { createJiti } from "jiti";
import pathUtils from "node:path";
import pm from "picomatch";
import { fileURLToPath } from "url";
import * as z from "zod";

const valueOrArray = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([z.array(schema), schema]);

export const makeConfigSchema = ({ root }: { root: string }) => {
  const pathLike = z.union([
    z.instanceof(URL).transform((url) => fileURLToPath(url)),
    z
      .string()
      .url()
      .startsWith("file:")
      .transform((url) => fileURLToPath(url)),
    z.string().transform((path) => pathUtils.resolve(root, path)),
  ]);

  const matcherFn = z.function().args(z.string()).returns(z.boolean());

  const matcherLike = z
    .union([
      valueOrArray(z.string()).transform((globs) => pm(globs, { cwd: root })),
      z
        .instanceof(RegExp)
        .transform((regex) => (str: string) => regex.test(str)),
      matcherFn,
    ])
    .pipe(matcherFn);

  return z.object({
    base: pathLike.default("."),

    input: z
      .object({
        include: matcherLike.default(["./**/*"]),
        exclude: matcherLike.default([]),
        isDynamic: matcherLike.default([
          "**/*.ts",
          "**/*.js",
          "**/*.tsx",
          "**/*.jsx",
        ]),
      })
      .default({}),

    dynamic: z
      .object({
        transformName: z
          .function()
          .args(z.string())
          .returns(z.string())
          .default(
            () => (path: string) => path.slice(0, path.lastIndexOf(".")),
          ),
        importer: z
          .function()
          .args(z.string())
          .returns(z.promise(z.unknown()))
          .default(() => {
            const jiti = createJiti(import.meta.url);
            return (path: string) => jiti.import(path, { default: true });
          }),
      })
      .default({}),

    build: z
      .object({
        clean: z.boolean().default(false),
        outDir: pathLike.default("./dist"),
        concurrency: z.number().int().positive().gt(0).default(4),
      })
      .default({}),
  });
};

type ConfigSchema = ReturnType<typeof makeConfigSchema>;
export type Config = z.output<ConfigSchema>;
export type ConfigInput = z.input<ConfigSchema>;
