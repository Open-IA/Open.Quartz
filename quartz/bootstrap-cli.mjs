#!/usr/bin/env -S node --no-deprecation
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { version } from "./cli/constants.js";

yargs(hideBin(process.argv))
  .scriptName("quartz")
  .version(version)
  .usage("$0 <cmd> [args]")
  .showHelpOnFail(false)
  .help()
  .strict()
  .demandCommand().argv;