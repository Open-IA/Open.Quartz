import { readFileSync } from "fs";

export const cwd = process.cwd();
/** @type {{ version: string }} */
export const { version } = JSON.parse(readFileSync("./package.json").toString());