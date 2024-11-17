# tiss

## A bare-bones static site generator

`tiss` will crawl through an input folder and copy files to a destination folder. If it finds any `.js`, `.ts`, `.jsx`, or `.tsx` files, it will run them and copy _that_ output to the destination.

### Get started

1. Install `tiss`

   ```sh
   $ npm i -D tiss       # if you use npm
   $ yarn add --dev tiss # if you use yarn
   ```

2. Create a [config file](#config) if you want

3. Copy your static files

   ```
   src
   ├── robots.txt
   └── index.html
   ```

4. Create your [dynamic handlers](#dynamic-handlers), they will run at build time and create a regular file in their place

   ```ts
   // src/latest-version.json.ts
   import { defineHandler } from "tiss";
   import pkg from "my-library/package.json" with { type: "json" };

   export default defineHandler(async () => ({
     LIBRARY_VERSION: pkg.version,
     NODE_VERSION: process.versions.node,
   }));
   ```

5. Add to your scripts

   ```diff
   // package.json
   "scripts": {
   +  "archive": "tiss archive",
   +  "build": "tiss build",
   +  "dev": "tiss dev"
   }
   ```

6. Run your build!

   ```sh
   $ npm run build  # if you use npm
   $ yarn run build # if you use yarn
   ```

### Dynamic handlers

A handler is a file with a `.js`, `.ts`, `.jsx`, or `.tsx` extension [(you can change this)](#config), with a `default` export.

The `default` export can be any of

- a `string`
- a `Buffer`, `ArrayBuffer`, `Uint8Array`, or any other typed array
- a Node.js `Readable` stream
- a `JSON.stringify`-able value
- a `Promise` that resolves to any of the above
- a `function` or an `async function` that returns any of the above

It will be called at build time and create a file with its result, removing the last extension (e.g. a `foo/bar.txt.ts` handler will create a `foo/bar.txt` file).

### Static files

Everything else that is in the build folder and is not a dynamic handler, will be copied to the output unchanged.

### CLI

```sh
$ tiss build   # builds the source and outputs to the destination folder
$ tiss dev     # runs a server with your site (not for production!)
$ tiss archive # builds the site into an zip file
```

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
