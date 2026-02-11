import { QuartzTransformerPlugin } from "../types";

// When we use `declare module "<third party module name>"`, we should first
// import the original third party module directly of indirectly. Such as this
// type `QuartzTransformerPlugin` is defined in `quartz/plugins/types.ts`, and
// this file import the "vfile" !
declare module "vfile" {
  interface DataMap {
    dates: {
      created: Date;
      modified: Date;
      published: Date;
    }
  }
}