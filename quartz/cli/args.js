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