import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export const ORIGIN_NAME = "origin";
export const UPSTREAM_NAME = "upstream";
export const QUARTZ_SOURCE_BRANCH = "v4";
export const cwd = process.cwd();
export const cacheDir = path.join(cwd, ".quartz-cache");
export const cacheFile = "./quartz/.quartz-cache/transpiled-build.mjs";
export const fp = "./quartz/build.ts";
/** @type {{ version: string }} */
export const { version } = JSON.parse(readFileSync("./package.json").toString());
export const contentCacheFolder = path.join(cacheDir, "content-cache");
