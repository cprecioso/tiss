import { createJiti } from "jiti";
import pathUtils from "node:path";
import pm from "picomatch";
import { fileURLToPath } from "url";
import * as z from "zod";
import { maybeArray, maybePromise } from "../util/zod";

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

  const matcherFn = z.function(z.tuple([z.string()]), z.boolean());

  const matcherLike = z
    .union([
      maybeArray(z.string()).transform((globs) => pm(globs, { cwd: root })),
      z
        .instanceof(RegExp)
        .transform((regex) => (str: string) => regex.test(str)),
      matcherFn,
    ])
    .pipe(matcherFn);

  return z
    .object({
      base: pathLike.default("./src"),

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
            .function(z.tuple([z.string()]), z.string())
            .default(
              () => (path: string) => path.slice(0, path.lastIndexOf(".")),
            ),
          importer: z
            .function(z.tuple([z.string()]), maybePromise(z.unknown()))
            .default(() => {
              const jiti = createJiti(import.meta.url);
              return (path: string) => jiti.import(path, { default: true });
            }),
          concurrency: z.number().int().positive().gt(0).default(4),
        })
        .default({}),

      build: z
        .object({
          outDir: pathLike.default("./public"),
          clean: z.boolean().default(false),
        })
        .default({}),

      archive: z
        .object({
          format: z.enum(["zip"]).default("zip"),
          outFile: pathLike.default("./archive.zip"),
        })
        .default({}),

      dev: z
        .object({
          port: z.number().default(2387),
          hostname: z.string().default("localhost"),
          indexFiles: z.string().array().default(["index.html", "index.htm"]),
        })
        .default({}),
    })
    .default({});
};

type ConfigSchema = ReturnType<typeof makeConfigSchema>;
export type Config = z.output<ConfigSchema>;
export type ConfigInput = z.input<ConfigSchema>;
