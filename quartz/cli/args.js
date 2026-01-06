/**
 * @typedef {object} CommonArgvInterface
 * @property {string} directory
 * @property {boolean} verbose
 */

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

/**
 * @typedef {object} SyncArgvInterface
 * @property {string} directory
 * @property {boolean} verbose
 * @property {boolean} commit
 * @property {string} message
 * @property {boolean} push
 * @property {boolean} pull
 */

export const SyncArgv = {
  ...CommonArgv,
  commit: {
    boolean: true,
    default: true,
    describe: "create a git commit for your unsaved changes",
  },
  message: {
    string: true,
    alias: ["m"],
    describe: "option to override the default Quartz commit message",
  },
  push: {
    boolean: true,
    default: true,
    describe: "push updates to your Quartz fork",
  },
  pull: {
    boolean: true,
    default: true,
    describe: "pull updates from your Quartz fork",
  },
};

/**
 * @typedef {object} BuildArgvInterface
 * @property {string} directory
 * @property {boolean} verbose
 * @property {string} output
 * @property {boolean} serve
 * @property {boolean} watch
 * @property {string} baseDir
 * @property {number} port
 * @property {number} wsPort
 * @property {string} remoteDevHost
 * @property {boolean} bundleInfo
 * @property {number} [concurrency]
 */

export const BuildArgv = {
  ...CommonArgv,
  output: {
    string: true,
    alias: ["o"],
    default: "public",
    describe: "output folder for files",
  },
  serve: {
    boolean: true,
    default: false,
    describe: "run a local server to live-preview your Quartz",
  },
  watch: {
    boolean: true,
    default: false,
    describe: "watch for changes and rebuild automatically"
  },
  baseDir: {
    string: true,
    default: "",
    describe: "base path to serve your local server on",
  },
  port: {
    number: true,
    default: 8080,
    describe: "port to serve Quartz on",
  },
  wsPort: {
    number: true,
    default: 3001,
    describe: "port to use for WebSocket-based hot-reload notifications",
  },
  remoteDevHost: {
    string: true,
    default: "",
    describe: "A URL override for the websocket connection if you are not developing on localhost",
  },
  bundleInfo: {
    boolean: true,
    default: false,
    describe: "show detailed bundle information",
  },
  concurrency: {
    number: true,
    describe: "how many threads to use to parse notes",
  },
};