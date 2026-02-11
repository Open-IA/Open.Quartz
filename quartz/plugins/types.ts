import { VFile } from "vfile";

type OptionType = object | undefined;
export type QuartzTransformerPlugin<Options extends OptionType = undefined> = (
  opts?: Options,
 ) => QuartzTransformerPluginInstance;
export type QuartzTransformerPluginInstance = {
  name: string;
};