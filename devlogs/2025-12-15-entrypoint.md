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