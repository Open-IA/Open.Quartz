---
title: 2026-01-04-command-update
tags:
  - computer-engineering
  - computer-frontend
  - open-source-project
  - quartz
  - typescript
project: quartz
time: 2026-01-04
---

## 1 Handlers of command `sync`

Notice git cannot upload target content of a symlink directory, it will copy
the symbolic link itself (a string) to git server like `../external-folder`.
So we should solve this problem by stash the content and copy target to the
project, after copying we can remove the target and pop the content.

``` js
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
// ...
if (contentStat.isSymbolicLink()) {
  await popContentFolder(contentFolder);
}
```

The code style is different between `handleSync` and `handleCreate`, `handleSync`
uses direct `return` to exit program but `handleCreate` uses `process.exit(0)`
to exit. And now I know at the first @jackyzha0 uses [`chalk`](https://github.com/chalk/chalk) to render the colored
text in terminal. But later in this [commit](https://github.com/jackyzha0/quartz/commit/951d1dec24eb8e0bea4ec548cc79c5ce718bf02f)
@fl0werpowers uses builtin function of node instead.

Differences between `spawn*` and `exec*` in `child_process` module is
+ `spawn*` is suitable for streaming output like `git push`, `push` itself takes
  time with different network environment. Thus `spawnSync` function return type
  is `SpawnSyncReturns<Buffer>`;
+ `exec*` is suitable for short returns like `git rev-parse --abbrev-ref HEAD`.
  This command returns the **current branch of git**.