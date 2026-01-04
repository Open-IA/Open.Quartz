import { isCancel, outro } from "@clack/prompts";
import { styleText } from "node:util";
import fs from "node:fs";
import process from "node:process";
import { contentCacheFolder } from "./constants.js";
import { spawnSync } from "node:child_process";

/**
 * In shell, some directories or files may contain space like 'My Favorite', and
 * shell will denote them using escape character like 'My\ Favorite'. Although
 * nodejs can deal with them correctly without this function. Original code has
 * a regex bug.
 * @param {string} fp input file path
 * @returns {string}
 */
export function escapePath(fp) {
  return fp
    .replace(/\\ /g, " ")
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();
}

/**
 * Used with `select` function of -clack/prompts, when user doesn't choose a
 * selection item and cancels, then the command line interface will exit.
 * @param {unknown} val 
 * @returns {void | unknown} if user cancels process will exit, return type is
 * void, if user chooses an item, return the item.
 */
export function exitIfCancel(val) {
  if (isCancel(val)) {
    outro(styleText("red", "Exiting"));
    process.exit(0);
  } else {
    return val;
  }
}

/**
 * Stash the content folder to cache folder. It 
 * 1. remove original cache folder
 * 2. copy content folder to cache folder
 * 3. remove content folder
 * @param {string} contentFolder the content folder of quartz
 */
export async function stashContentFolder(contentFolder) {
  await fs.promises.rm(contentCacheFolder, {
    force: true,
    recursive: true,
  });
  await fs.promises.cp(contentFolder, contentCacheFolder, {
    force: true,
    recursive: true,
    verbatimSymlinks: true,
    preserveTimestamps: true,
  });
  await fs.promises.rm(contentFolder, {
    force: true,
    recursive: true,
  });
}

/**
 * Pull specified branch of given git repository
 * @param {string} origin remote git repository name
 * @param {string} branch specified branch name
 */
export function gitPull(origin, branch) {
  const flags = [
    "--no-rebase",  // [+] using merge instead of rebasing when both behaviors are possible
    "--autostash",  // [+] automatically saves and restores local uncommitted changes when a command needs a clean working tree
    "-s",           // [+] selects recursive merge strategy
    "recursive",
    "-X",           // [+] keep our version when there is merge conflicts
    "ours",
    "--no-edit"     // [+] do not open editors like vim / nano
  ];
  const out = spawnSync("git", ["pull", ...flags, origin, branch], {
    stdio: "inherit"
  });

  if (out.stderr) {
    throw new Error(styleText("red", `Error while pulling updates: ${out.stderr}`));
  } else if (out.status !== 0) {
    throw new Error(styleText("red", `Error while pulling updates`));
  }
}

/**
 * Pop content folder from cache and delete cache folder.
 * @param {string} contentFolder 
 */
export async function popContentFolder(contentFolder) {
  await fs.promises.rm(contentFolder, {
    force: true,
    recursive: true,
  });
  await fs.promises.cp(contentCacheFolder, contentFolder, {
    force: true,
    recursive: true,
    verbatimSymlinks: true,
    preserveTimestamps: true,
  });
  await fs.promises.rm(contentCacheFolder, {
    force: true,
    recursive: true,
  });
}
