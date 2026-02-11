/// <reference path="./args.js"/>

import fs, { promises } from "node:fs";
import path from "node:path";
import process from "node:process";
import { styleText } from "node:util";
import { intro, outro, select, text } from "@clack/prompts";
import { CreateArgv } from "./args.js";
import esbuild from "esbuild";
import sassPlugin from "esbuild-sass-plugin";
import {
  ORIGIN_NAME,
  QUARTZ_SOURCE_BRANCH,
  UPSTREAM_NAME,
  cacheFile,
  cwd, fp, version
} from "./constants.js";
import { escapePath, exitIfCancel, gitPull, popContentFolder, stashContentFolder } from "./helpers.js";
import { execSync, spawnSync } from "node:child_process";
import { Mutex } from "async-mutex";
import prettyBytes from "pretty-bytes";
import { randomUUID } from "node:crypto";

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
    await popContentFolder(contentFolder);
    process.exit(1);
  }

  await popContentFolder(contentFolder);
  console.log("Ensuring dependencies are up to date");
}

/**
 * Handle command `npx quartz restore`, it restores the content folder.
 * @param {import("./args.js").CommonArgvInterface} argv 
 */
export async function handleRestore(argv) {
  const contentFolder = resolveContentPath(argv.directory);
  await popContentFolder(contentFolder);
}

/**
 * Handle command `npx quartz sync`, it syncs with github repo.
 * @param {import("./args.js").SyncArgvInterface} argv
 */
export async function handleSync(argv) {
  const contentFolder = resolveContentPath(argv.directory);
  console.log(`\n${styleText(["bgGreen", "black"], ` Quartz v${version} `)}\n`);
  console.log("Backing up your content");

  if (argv.commit) {
    const contentStat = await fs.promises.lstat(contentFolder);
    if (contentStat.isSymbolicLink()) {
      const linkTarget = await fs.promises.readlink(contentFolder);
      console.log(styleText("yellow", "Detected symlink, trying to dereference before committing"));

      // Notice git cannot upload target symbolic link content of a directory

      // stash symlink files
      await stashContentFolder(contentFolder);
      // follow symlink and copy content
      await fs.promises.cp(linkTarget, contentFolder, {
        force: true,
        recursive: true,
        preserveTimestamps: true,
      });
    }

    const currentTimestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    // a timestamp like 'Jan 4, 2026, 10:38 PM'
    const commitMessage = argv.message ?? ` Quartz sync: ${currentTimestamp} `;
    spawnSync("git", ["add", "."], { stdio: "inherit" });
    spawnSync("git", ["commit", "-m", commitMessage], { stdio: "inherit" });

    if (contentStat.isSymbolicLink()) {
      // put symlink back
      await popContentFolder(contentFolder);
    }
  }

  await stashContentFolder(contentFolder);

  if (argv.pull) {
    console.log(
      "Pulling updates from your repository. You may need to resolve some `git` conflicts if you've made changes to components or plugins."
    );
    try {
      gitPull(ORIGIN_NAME, QUARTZ_SOURCE_BRANCH);
    } catch {
      console.log(styleText("red", "An error occurred above while pulling updates."));
      await popContentFolder(contentFolder);
      process.exit(1);
    }
  }

  await popContentFolder(contentFolder);
  if (argv.push) {
    console.log("Pushing your changes.");
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const res = spawnSync("git", ["push", "-uf", ORIGIN_NAME, currentBranch], {
      stdio: "inherit"
    });
    // exec* is suitable for short output and it will return the result (stdout,
    // stderr) after caching. It provides one-time output after the child process
    // exit.
    // spawn* is suitable for streaming output, it returns Buffers. So the type
    // of `res` is `SpawnSyncReturns<Buffer>`.
    if (res.status !== 0) {
      console.log(
        styleText("red", `An error occurred above while pushing to remote ${ORIGIN_NAME}`),
      );
      process.exit(1);
    }
  }

  console.log(styleText("green", "Done!"));
}

/**
 * Handle `npx quartz build`
 * @param {import("./args.js").BuildArgvInterface} argv
 */
export async function handleBuild(argv) {
  if (argv.serve) {
    argv.watch = true;
  }

  console.log(`\n${styleText(["bgGreen", "black"], ` Quartz v${version} `)} \n`);

  // These config options need understanding of esbuild.
  // Generally, context is a reusable pipeline with rules for JS/TS, JSX, Sass
  // and some special inline files. So it can rebuild, watch or dispose later.
  // Now nothing is built yet, you're just defining how builds should happen.
  // ctx can later be used with 'ctx.rebuild()' and 'ctx.watch()' etc.
  const ctx = await esbuild.context({
    // [+] entrypoint bundle script file
    entryPoints: [fp],
    outfile: cacheFile,
    // [+] pulls in all imported files into one bundle (except externals)
    bundle: true,
    // [+] keep names for debug and function call stack
    keepNames: true,
    // [+] 'minifyWhitespace' and 'minifySyntax' can shrinks code. Smaller output
    //   but still debuggable.
    minifyWhitespace: true,
    minifySyntax: true,
    // [+] output is meant to be run in Node.js
    platform: "node",
    // [+] ES modules (import / export)
    format: "esm",
    // [+] This transform is introduced in React 17+
    jsx: "automatic",
    jsxImportSource: "preact",
    // [+] This means that all package imports considered external to the bundle
    //   and the dependencies are not bundled. So the dependencies must still on
    //   the file system when your bundle is running. At runtime, Node still be
    //   able to resolve them from 'node_modules'
    packages: "external",
    // [+] This option tells esbuild to produce some metadata about the build in
    //   JSON format.
    metafile: true,
    // [+] sourcemap can make it easier to debug code.
    sourcemap: true,
    // [+] source maps don't embed full source code. For smaller code and source
    //   files must exist on disk.
    sourcesContent: false,
    plugins: [
      // [+] .scss is compiled and output is CSS as a string. This is useful for
      //   injecting styles via JS.
      sassPlugin({
        type: "css-text",
        cssImports: true,
      }),
      // [+] Only applies to '*.inline.scss', output actual CSS. Likely meant to
      //   be inlined directly into the bundle or DOM.
      sassPlugin({
        filter: /\.inline\.scss$/,
        type: "css",
        cssImports: true,
      }),
      {
        name: "inline-script-loader",
        setup(build) {
          build.onLoad({ filter: /\.inline\.(ts|js)$/ }, async (args) => {
            let text = await promises.readFile(args.path, "utf8");

            // Remove default exports that we manually inserted
            // It turns modules into plain scripts. Likely because this code will
            // be embedded but not imported.
            text = text.replace("export default", "");
            text = text.replace("export", "");

            const sourcefile = path.relative(path.resolve("."), args.path);
            const resolveDir = path.dirname(sourcefile);
            const transpiled = await esbuild.build({
              stdin: {
                contents: text,
                loader: "ts",
                resolveDir,
                sourcefile,
              },
              write: false,
              bundle: true,
              minify: true,
              platform: "browser",
              format: "esm",
            });
            const rawMod = transpiled.outputFiles[0].text;
            return {
              contents: rawMod,
              loader: "text",
            };
            // The final bundle gets the string contents of the compiled JS.
            // Not a JS module but just a raw text.
          })
        },
      }
    ]
  });

  const buildMutex = new Mutex();
  let lastBuildMs = 0;
  let cleanupBuild = null;

  /**
   * This function is a build pipeline. It will be called when files are changed
   * and the watch mode is enabled.
   * @param {() => void} clientRefresh
   */
  const build = async (clientRefresh) => {
    const buildStart = new Date().getTime();
    lastBuildMs = buildStart;
    // Their units are both in ms

    const release = await buildMutex.acquire();
    // 'release' is a object of MutexInterface.Releaser, which is a function
    // () => void. Calling it will release the mutex.

    if (lastBuildMs > buildStart) {
      release();
      return;
    }

    if (cleanupBuild) {
      console.log(styleText("yellow", "Detected a source code change, doing a hard rebuild ..."));
      await cleanupBuild();
    }

    const result = await ctx.rebuild().catch((err) => {
      console.error(`${styleText("red", "Couldn't parse Quartz configuration: ")} ${fp}`);
      console.log(`Reason: ${styleText("grey", err)}`);
      process.exit(1);
    });
    release();

    if (argv.bundleInfo) {
      const outputFileName = cacheFile;
      const meta = result.metafile.outputs[outputFileName];
      console.log(
        `Successfully transpiled ${Object.keys(meta.inputs).length} files (${prettyBytes(
          meta.bytes,
        )})`
      );
      console.log(await esbuild.analyzeMetafile(result.metafile, {
        color: true,
      }));
    }

    //! Important issue
    // 
    // Following code imports the transpiled build module with a unique query
    // parameter to bypass Node.js ES module cache, ensuring the latest version
    // is loaded on each esbuild during watch mode. It's necessary because the
    // build output changes when source files change, and without cache-busting.
    // Node would reuse the stale cached module.
    //
    // Notice this import is relative, so base 'cacheFile' cannot be used.
    //
    // ES module (which is managed by V8 engine) doesn't have a cache invalidate
    // API so it's hard to implement "hot-reload". When use a random uuid query
    // parameter, Node.js will treat it as a new module.
    //
    // Hot reload is necessary because the build module imports users configuration
    // at load time, and when configuration changes, the entire module must be
    // reloaded to pick up new plugin configurations. The cache-busting ensures
    // the latest build function is always used during watching development.
    //
    // 'quartz/.quartz-cache/transpiled-build.mjs' exports { build_default as default }
    // Following code renames the 'default' to 'buildQuartz'. So this function's
    // type is same with the default exported function in '../build.ts'

    /** @type {{ default: typeof import("../build.ts").default }} */
    const { default: buildQuartz } = await import(`../../${cacheFile}?update=${randomUUID()}`);

  }

}