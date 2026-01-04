/// <reference path="./args.js"/>

import fs, { promises } from "node:fs";
import path from "node:path";
import process from "node:process";
import { styleText } from "node:util";
import { intro, outro, select, text } from "@clack/prompts";
import { CreateArgv } from "./args.js";

import {
  QUARTZ_SOURCE_BRANCH,
  UPSTREAM_NAME,
  cwd, version
} from "./constants.js";
import { escapePath, exitIfCancel, gitPull, stashContentFolder } from "./helpers.js";
import { execSync } from "node:child_process";

/**
 * Resolve content directory path
 * @param {string} contentPath path to resolve
 * @returns {string} resolve absolute path to relative path, resolve relative
 * path to absolute path
 */
function resolveContentPath(contentPath) {
  if (path.isAbsolute(contentPath)) return path.relative(cwd, contentPath);
  // This will return the relative path from our current working directory, that
  // is the root of this project
  return path.join(cwd, contentPath);
}

/**
 * Handles command `npx quartz create`
 * @param {import("./args.js").CreateArgvInterface} argv
 */
export async function handleCreate(argv) {
  console.log();
  intro(styleText(["bgGreen", "black"], ` Quartz v${version} `));
  const contentFolder = resolveContentPath(argv.directory);
  let setupStrategy = argv.strategy?.toLowerCase();
  let linkResolutionStrategy = argv.links?.toLowerCase();
  const sourceDirectory = argv.source;

  // If all command arguments were provided, check if they are valid
  if (setupStrategy && linkResolutionStrategy) {
    // If setup strategy is not "new" then source is required (one is copy, and
    // another is symlink, they all require source)
    if (setupStrategy !== "new") {
      // source is not provided
      if (!sourceDirectory) {
        outro(
          styleText(
            "red",
            `Setup strategies (arg '${styleText(
              "yellow", 
              `-${CreateArgv.strategy.alias[0]}`,
            )}') other than '${styleText(
              "yellow",
              "new"
            )}' require content folder argument ('${styleText(
              "yellow",
              `-${CreateArgv.source.alias[0]}`,
            )}') to be set`,
          ),
        );
        // Output a warning message and then exit
        process.exit(1);
      } else {
        // System doesn't have the given source directory
        if (!fs.existsSync(sourceDirectory)) {
          outro(
            styleText(
              "red",
              `Input directory to copy/symlink 'content' from not found ('${styleText(
                "yellow",
                sourceDirectory
              )}', invalid argument "${styleText("yellow", `-${CreateArgv.source.alias[0]}`)}")`,
            ),
          );
          process.exit(1);
        } else if (!fs.lstatSync(sourceDirectory).isDirectory()) {
          outro(
            styleText(
              "red",
              `Source directory to copy/symlink 'content' from is not a directory (found file at
              '${styleText(
                "yellow",
                sourceDirectory
              )}', invalid argument ${styleText("yellow", `-${CreateArgv.source.alias[0]}`)})`,
            ),
          );
          process.exit(1);
        }
      }
    }
  }

  if (!setupStrategy) {
    setupStrategy = exitIfCancel(
      await select({
        message: `Choose how to initialize the content in \`${contentFolder}\``,
        options: [
          {
            value: "new",
            label: "Empty Quartz",
          },
          {
            value: "copy",
            label: "Copy an existing folder",
          },
          {
            value: "symlink",
            label: "Symlink an existing folder",
            hint: "don't select this unless you know what you are doing!",
          }
        ]
      })
    );
  }

  async function rmContentFolder() {
    const contentFolderStat = await promises.lstat(contentFolder);
    if (contentFolderStat.isSymbolicLink()) {
      await promises.unlink(contentFolder);
    } else {
      await promises.rm(contentFolder);
    }
  }

  const gitkeepPath = path.join(contentFolder, ".gitkeep");
  if (fs.existsSync(gitkeepPath)) {
    await promises.unlink(gitkeepPath);
    // Delete the .gitkeep file
  }

  if (setupStrategy === "copy" || setupStrategy === "symlink") {
    let originalFolder = sourceDirectory;

    // `--source` is not provided
    if (!sourceDirectory) {
      originalFolder = escapePath(
        exitIfCancel(
          await text({
            message: "Enter the full path to existing content folder",
            placeholder:
              "On most terminal simulator, you can drag and drop a folder into the window and it will paste the full path",
            validate(fp) {
              const fullPath = escapePath(fp);
              if (!fs.existsSync(fp)) {
                return "The given path doesn't exist";
              } else if (!fs.lstatSync(fullPath).isDirectory) {
                return "The given path is not a folder";
              }
            },
            // After ES6, functions in object property can be simplified from
            //   validate: function(fp) {}
            // to 
            //   validate(fp) {}
          }),
        ),
      );
    }

    await rmContentFolder();
    if (setupStrategy === "copy") {
      await promises.cp(originalFolder, contentFolder, {
        recursive: true,
        preserveTimestamps: true,
      });
    } else if (setupStrategy === "symlink") {
      await promises.symlink(originalFolder, contentFolder)
    }
  } else if (setupStrategy === "new") {
    await promises.writeFile(
      path.join(contentFolder, "index.md"),
      `---
title: Welcome to Quartz
---

This is a blank quartz installation.
See the [documentation](https://quartz.jzhao.xyz) for how to get started.
`,
    );
  }

  if (!linkResolutionStrategy) {
    linkResolutionStrategy = exitIfCancel(
      await select({
        message: `Choose how Quartz should resolve links in your content. This should match Obsidian's link format. You can change this later in \`quartz.config.ts\`.`,
        options: [
          {
            value: "shortest",
            label: "Treat links as shortest path",
            hint: "(default)"
          },
          {
            value: "absolute",
            label: "Treat links as absolute path",
          },
          {
            value: "relative",
            label: "Treat links as relative path",
          },
        ],
      }),
    );
  }

  // Now, do config changes
  const configFilePath = path.join(cwd, "quartz.config.ts");
  let configContent = await promises.readFile(configFilePath, {
    encoding: "utf-8"
  });
  configContent = configContent.replace(
    /markdownLinkResolution: ['"](.+)['"]/,
    `markdownLinkResolution: "${linkResolutionStrategy}"`
  );
  await promises.writeFile(configFilePath, configContent);

  execSync(
    `git remote show upstream || git remote add upstream https://github.com/jackyzha0/quartz.git`, {
      stdio: "ignore"
    }
  );

  outro(`You're all set! Not sure what to do next? Try:
  • Customizing Quartz a bit more by editing \`quartz.config.ts\`
  • Running \`npx quartz build --serve\` to preview your Quartz locally
  • Hosting you Quartz online (see: https://quartz.jzhao.xyz/hosting)`);
}

/**
 * Handles command `npx quartz update`, it updates the project using github repo
 * @param {import("./args.js").CommonArgvInterface} argv
 */
export async function handleUpdate(argv) {
  const contentFolder = resolveContentPath(argv.directory);
  console.log(`\n${styleText(["bgGreen", "black"], ` Quartz v${version} `)}\n`);
  console.log("Backing up your content");
  execSync(
    `git remote show upstream || git remote add upstream https://github.com/jackyzha0/quartz.git`, {
      stdio: "ignore"
    }
  );
  await stashContentFolder(contentFolder);
  console.log(
    "Pulling updates... you may need to resolve some `git` conflicts if you've made changes to components or plugins.",
  );

  try {
    gitPull(UPSTREAM_NAME, QUARTZ_SOURCE_BRANCH);
  } catch {
    console.log(styleText("red", "An error occurred above while pulling updates."));
    
  }
}
