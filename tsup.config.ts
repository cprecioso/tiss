import { versions } from "node:process";
import semver from "semver";
import { defineConfig } from "tsup";

const NODE_MAJOR = semver.parse(versions.node);

export default defineConfig({
  entry: ["./src/lib.ts", "./src/bin.ts"],
  outDir: "./dist",
  clean: true,

  platform: "node",
  target: `node${NODE_MAJOR}`,
  format: ["esm"],
  dts: true,
});
