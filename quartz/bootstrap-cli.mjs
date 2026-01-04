#!/usr/bin/env -S node --no-deprecation
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  handleCreate, handleRestore, handleUpdate
} from "./cli/handlers.js"
import { CommonArgv, CreateArgv } from "./cli/args.js";
import { version } from "./cli/constants.js";
import process from "node:process";

yargs(hideBin(process.argv))  // hideBin(): slice process.argv from index 2
  .scriptName("quartz")       // scriptName(): set the name of our script $0
  .version(version)           // version(): show the version when argument is `--version` or `-v`
  .usage("$0 <cmd> [args]")   // usage(): $0 is replaced by script name and <cmd> will be list of command's names
  .command("create", "Initialize Quartz", CreateArgv, async (argv) => {
    await handleCreate(argv);
  })
  .command("update", "Get the latest Quartz updates", CommonArgv, async (argv) => {
    await handleUpdate(argv);
  })
  .command("restore", "Try to restore your content folder from the cache", CommonArgv, async (argv) => {
    await handleRestore(argv);
  })
  .showHelpOnFail(false)      // showHelpOnFail(): the argument `enable` is set to false, so the message won't show up
  .help()                     // help(): show the help message when argument is `--help` or `-h`
  .strict()
  .demandCommand().argv;
