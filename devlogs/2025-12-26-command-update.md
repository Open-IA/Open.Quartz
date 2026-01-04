---
title: 2025-12-26-command-update
tags:
  - computer-engineering
  - computer-frontend
  - open-source-project
  - quartz
  - typescript
project: quartz
time: 2025-12-26
---

## 1 Handlers of command `update`

Command `update` updates the project with upstream `github:jackyzha0/quartz`.
So it will use `git pull` and we can encapsulate a function to do this:

### 1.1 Encapsulate a git pulling function

We can first encapsulate a git pulling function for `update` command. This function
should receive two parameters: `origin` (origin git repo) and `branch`. Notice
that we should first stash content folder to a cache then use git pull, and then
pop the cache when finishing git pull.

``` js
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
```

### 1.2 Stash and pop content folder

Before git pull we should first stash the content folder to avoid git conflict
in content folder. This `stashContentFolder` function first remove the content
cache, then copy the original content folder to cache, finally then remove the
original content folder.

``` js
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
```

After git pull we should pop the content cache out to original directory.

``` js
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
```