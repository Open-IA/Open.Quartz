import { QuartzPluginData } from "../plugins/vfile";

// `ValidateDateType` resolves to `"created" | "modified" | "published"` instead
// of `never` because of the `declare module "vfile"` augmentation in `lastmod.ts`
// adds the `dates` field into `QuartzPluginData`. Without this augmentation,
// TypeScript wouldn't know about the `dates` property on `QuartzPluginData`.
export type ValidateDateType = keyof Required<QuartzPluginData>["dates"];