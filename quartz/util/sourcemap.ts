import fs from "node:fs";
import sourceMapSupport from "source-map-support";
import { fileURLToPath } from "node:url";

export const options: sourceMapSupport.Options = {
  // Other fields like 'handleUncaughtExceptions', 'handleUncaughtRejections'
  // are default to 'true'.
  //
  // source map hack to get around query param. The key part is the
  // 'retrieveSourceMap' function, which handles the cache-busting query parameters
  // used during hot-reload. When a source includes '.quartz-cache' and a query
  // parameter (e.g. '?update=<uuid>'), it strips the query and appends '.map'
  // to load the corresponding source map file.
  //
  // For instance: 'transpiled-build.mjs' => 'transpiled-build.mjs.map'
  // 
  // This function changes the path in error stack to the map file.
  retrieveSourceMap(source) {
    if (source.includes(".quartz-cache")) {
      let realSource = fileURLToPath(source.split("?", 2)[0] + ".map");
      return {
        map: fs.readFileSync(realSource, "utf8"),
      }
    } else {
      return null;
    }
  },
}