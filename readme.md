# tiss

## A bare-bones static site generator

`tiss` will crawl through an input folder and copy files to a destination folder. If it finds any `.js`, `.ts`, `.jsx`, or `.tsx` files, it will run them and copy _that_ output to the destination.

### Config

Everything is optional (even the config file itself), values shown are default values:

```ts
// app.config.ts
import { defineConfig } from "tiss";

// All paths are relative to the folder where the config file is

export default defineConfig({
  base: "./src", // Where the site root is

  input: {
    // All of these options accept either a glob string, an array of glob strings, a regular expression, or a (string) => boolean function.

    include: ["./**/*"], // Which files to include in the output
    exclude: [], // Which files to exclude in the output
    isDynamic: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx"], // Which files to consider dynamic
  },

  dynamic: {
    transformName: internal_removeExtension, // By default, if a dynamic file is e.g. `hello.txt.ts`, it's transformed to `hello.txt`
    importer: jiti.import, // How to call the dynamic files, should return a promise of a no-arguments function. By default, we use `jiti` to be able to run TypeScript files on-the-fly.
    concurrency: 4, // How many files to be running at once
  },

  build: {
    outDir: "./public", // Where to output the built site
    clean: false, // Whether to empty the output dir before running the build
  },

  archive: {
    format: "zip", // Which archive format to use, right now only `zip` is supported
    outFile: "./archive.zip", // Where to write the archive
  },

  dev: {
    port: 2387, // The port for the server
    hostname: "localhost", // The host for the server
    indexFiles: ["index.html", "index.htm"], // Which files to use as index files for when a folder is requested (after the dynamic code is run)
  },
});
```
