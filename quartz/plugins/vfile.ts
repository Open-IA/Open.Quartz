// This file defines core types and utilities for file metadata in Quartz's
// processing pipeline.

import { Data, VFile } from "vfile";

// It exports the `QuartzPluginData` as an alias for the vfile `Data` type, which
// is the central data structure attached to each VFile during processing,
// accumulating metadata from transformers. It includes frontmatter, dates, TOC,
// blocks, HTML AST, and other fields.
export type QuartzPluginData = Data;