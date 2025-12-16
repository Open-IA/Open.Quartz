---
title: 2025-12-15-entrypoint
tags:
  - computer-engineering
  - computer-frontend
  - open-source-project
  - quartz
  - typescript
project: quartz
time: 2025-12-15
---

## 1 Entry Point

### 1.1 First encounter with `yargs`

There is a command line entry point file `quartz/bootstrap-cli.mjs`, and it uses
`yargs` node package to parse command arguments.

Also there is a shebang at the top of file:

```
#!/usr/bin/env -S node --no-deprecation
```

Argument `-S` means `--split-string`, it will split the string into independent
parts, avoid passing arguments as a complete string. Using `/usr/bin/env` can
find `node` executable program automatically, so it enables the project to be
cross-platform. `--no-deprecation` shuts down all API deprecation warning of
node.

``` js
yargs(hideBin(process.argv))  // hideBin(): slice process.argv from index 2
  .scriptName("quartz")       // scriptName(): set the name of our script $0
  .version(version)           // version(): show the version when argument is `--version` or `-v`
  .usage("$0 <cmd> [args]")   // usage(): $0 is replaced by script name and <cmd> will be list of command's names
  .showHelpOnFail(false)      // showHelpOnFail(): the argument `enable` is set to false, so the message won't show up
  .help()                     // help(): show the help message when argument is `--help` or `-h`
```

Variable `version` is parsed from `package.json` using `readFileSync()` and
`JSON.parse()` to read `version` property in it. `version` is imported from
`quartz/cli/constants.js` (Notice when importing in ESM module system, node needs
to use explicit postfix `.js`).

``` js
/** @type {{ version: string }} */
export const { version } = JSON.parse(readFileSync("./package.json").toString());
```

### 1.2 The setup of commands in `yargs`

In `quartz`, `command` function imported from `yargs` is used as below:

``` js
// Instance of yargs ...
.command(
  // <command-name>, 
  // <command-description>,
  // <arguments-vector>,
  // <asynchronous-handler-function>
)
// Other commands of yargs
```

`<arguments-vector>` is an object defined in `quartz/cli/args.js`, and its
structure is like below (every usage and purpose of commands will show up in
following devlogs):

``` js
export const CommonArgv = {
  directory: {
    // The command argument's name, commonly full name like `--directory`
    string: true,
    // The type of current command argument
    alias: ["d"],
    // Alias list of current command argument, like `-d`
    default: "content",
    // Default value when the value is not given
    describe: "directory to look for content files",
    // Description shown in help
  },
  verbose: {
    boolean: true,
    alias: ["v"],
    default: false,
    describe: "print out extra logging information",
  },
};
```

`CommonArgv` is common parts of arguments vector of all commands. So other
arguments vectors can be seen as derived from `CommonArgv` like:

``` js
export const CreateArgv = {
  ...CommonArgv,
  source: {
    string: true,
    alias: ["s"],
    describe: "source directory to copy/create symlink from",
  },
  strategy: {
    string: true,
    alias: ["X"],
    choices: ["new", "copy", "symlink"],
    // Choices of value of current command argument
    describe: "strategy to resolve links",
  },
  links: {
    string: true,
    alias: ["l"],
    choices: ["absolute", "shortest", "relative"],
    describe: "strategy to resolve links",
  }
};
```

Now using commands like `./quartz/bootstrap-cli.mjs create --help` will show

``` plaintext
❯ ./quartz/bootstrap-cli.mjs create -s --help
quartz create

Initialize Quartz

Options:
      --version    Show version number                                 [boolean]
      --help       Show help                                           [boolean]
  -d, --directory  directory to look for content files
                                                   [string] [default: "content"]
  -v, --verbose    print out extra logging information[boolean] [default: false]
  -s, --source     source directory to copy/create symlink from         [string]
  -X, --strategy   strategy to resolve links
                                    [string] [choices: "new", "copy", "symlink"]
```

`<asynchronous-handler-function>` is an asynchronous handler function defined in
`quartz/cli/handlers.js`.