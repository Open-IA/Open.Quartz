---
title: 2025-12-16-command-create
tags:
  - computer-engineering
  - computer-frontend
  - open-source-project
  - quartz
  - typescript
project: quartz
time: 2025-12-16
---

## 1 Handlers of command `create`

### 1.1 Usage of library `@clack/prompts`

`quartz` uses `@clack/prompts` to show the interaction in command line. `intro`
is the intro part of command line interface like:

``` plaintext
┌   Quartz v1.0.0 
│
```

In [entrypoint](./2025-12-15-entrypoint.md) we say asynchronous handler function
defined in `quartz/cli/handlers.js` receives an arguments vector, so we need to
declare a type of those arguments vectors for handlers, otherwise TypeScript
server won't take effects:

``` js
/**
 * @typedef {object} CreateArgvInterface
 * @property {string} directory
 * @property {boolean} verbose
 * @property {string} source
 * @property {"new" | "copy" | "symlink"} [strategy]
 * @property {string} [links]
 */

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

and we can declare jsdoc like this for handler function `handleCreate`:

``` js
/**
 * Handles command `npx quartz create`
 * @param {import("./args.js").CreateArgvInterface} argv
 */
export async function handleCreate(argv) { /* ... */ }
```

At the beginning of function `handleCreate`, it first checks if argument
`--strategy` and `--link` provided. When `--strategy` is not `"new"`, we will
check the property of `sourceDirectory` (which is the value of argument `--source`),
if it's not provided, then we exit the command line interface using `outro` function
of `@clack/prompts`:

``` js
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
```

and the effect is like this:

``` plaintext
└  Setup strategies (arg '-X') other than 'new' require content folder argument ('-s') to be set
```

other errors like `--source` is not a directory, `--source` directory does not
exist, we all use `outro` to handle them.

If `--strategy` is not provided, then our command line interface will ask user to
select a strategy from `"new"`, `"copy"` and `"strategy"`. We can use the
`select` function of `@clack/prompts`:

``` js
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
```

and its effect is like this:

``` plaintext
┌   Quartz v1.0.0 
│
◆  Choose how to initialize the content in `/home/ashgrey/Github/Open.Quartz/content`
│  ○ Empty Quartz
│  ○ Copy an existing folder
│  ● Symlink an existing folder (don't select this unless you know what you are doing!)
└
```

When we cancel the selection, the command line interface should also exit, so
we can introduce an util function in `quartz/cli/helpers.js`:

``` js
import { isCancel, outro } from "@clack/prompts";

export function exitIfCancel(val) {
  if (isCancel(val)) {
    outro(styleText("red", "Exiting"));
    process.exit(0);
  } else {
    return val;
  }
}
```

### 1.2 First encountered bug

There is a bug of regex replacement in function `escapePath`, and I have reported
the [issue](https://github.com/jackyzha0/quartz/issues/2253) and a
[fix PR](https://github.com/jackyzha0/quartz/pull/2254).

Original regex will convert path like `"../Test Directory"` to literal string
`"$1"` but not matched content. So I fix the function `escapePath` like this:

``` js
export function escapePath(fp) {
  return fp
    .replace(/\\ /g, " ")
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();
}
```

### 1.3 Some new tricks for me

1. After ES6, function property defined in object can omit `function` keyword:

  ``` js
  // Before ES6
  const testObject = {
    validate: function(filePath) {
      // ...
    }
  }

  // After ES6
  const testObject = {
    validate(filePath) {
      // ...
    }
  }
  ```

2. In shell, command like `<command-a> || <command-b>` will first execute command
  `a` and if it returns non-zero return code, shell will execute command `b`.