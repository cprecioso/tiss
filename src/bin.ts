#!/usr/bin/env node

import { runExit } from "clipanion";
import pkg from "../package.json" with { type: "json" };
import { commands } from "./cmd";

await runExit(
  {
    binaryName: pkg.name,
    binaryVersion: pkg.version,
  },
  commands,
);
