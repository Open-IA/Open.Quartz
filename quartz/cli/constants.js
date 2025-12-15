import { readFileSync } from "fs";

/** @type {{ version: string }} */
export const { version } = JSON.parse(readFileSync("./package.json").toString());