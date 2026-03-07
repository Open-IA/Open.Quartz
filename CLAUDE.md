# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

> You can't edit files by yourself because its a copy-learning project FOR ME.

## Project Overview

**Open.Quartz** is a copy-learning project based on
[jackyzha0/quartz](https://github.com/jackyzha0/quartz) — a fast,
batteries-included static-site generator that transforms Markdown content into
fully functional websites.

This is an educational endeavor to understand static-site generator architecture
by rebuilding it step-by-step. The codebase is in early development phase — many
features are partial or planned.

## Common Commands

```bash
# Create a new Quartz site
npm run quartz create

# Build the site (generates static HTML to `public/` by default)
npm run quartz build

# Build with live preview server
npm run quartz build -- --serve

# Build with watch mode for hot reload
npm run quartz build -- --serve --watch

# Sync with GitHub
npm run quartz sync

# Restore from cache
npm run quartz restore

# Run tests (uses Node.js built-in test runner with tsx)
npm test

# Run a specific test file
npm test quartz/util/path.test.ts
```

## Architecture

### Path Type System (Nominal Typing)

The project uses **nominal typing** to prevent path-related bugs. Different path
types are NOT interchangeable, enforced through branded types and type guards:

- `FilePath` — Real file paths on disk (must have extension, cannot be relative)
- `FullSlug` — General URL-safe slugs (can have extensions, no forbidden chars)
- `SimpleSlug` — Simplified slugs (no `/index` ending, no file extensions)
- `RelativeURL` — Relative hrefs starting with `.` or `..`

**Always use type guard functions** before using these types:

- `isFilePath(s)` — validates and narrows to `FilePath`
- `isFullSlug(s)` — validates and narrows to `FullSlug`
- `isSimpleSlug(s)` — validates and narrows to `SimpleSlug`
- `isRelativeURL(s)` — validates and narrows to `RelativeURL`

Path utilities are isomorphic (work in both Node.js and browser) — they avoid
Node-specific `path` module.

### Plugin Architecture

Plugins extend the `VFile` data through TypeScript module augmentation:

```typescript
declare module "vfile" {
  interface DataMap {
    yourPluginData: YourType;
  }
}
```

Plugin types are defined in `quartz/plugins/types.ts`:

- `QuartzTransformerPlugin<Options>` — Content transformation plugins
- `QuartzFilterPlugin` — Content filtering
- `QuartzEmitterPlugin` — File generation

### Build Pipeline

- Entry point: `quartz/bootstrap-cli.mjs` (yargs CLI)
- Build orchestration: `quartz/build.ts` (still skeletal)
- Configuration: `quartz/cfg.ts` — defines `GlobalConfiguration` and
  `QuartzConfig`
- User config: `quartz.config.ts` in project root

### Internationalization

- 30+ locales in `quartz/i18n/locales/`
- Type definitions in `quartz/i18n/locales/definition.ts`
- Access via `i18n(locale)` function from `quartz/i18n`

### Testing

- Uses Node.js built-in test runner with `tsx`
- Tests are colocated with source files (e.g., `quartz/util/path.test.ts`)
- Comprehensive examples in JSDoc comments serve as documentation

## File Structure Notes

- `quartz/cli/` — Command implementations in JavaScript (compiled output from
  source)
- `quartz/commands/` — Not present (CLI handled by `cli/` directory)
- `quartz/components/` — JSX components for page rendering
- `quartz/util/` — Utilities, including the critical path type system

## Development Conventions

1. **Use nominal typing for paths** — Never cast to path types without using
   type guard functions first
2. **JSDoc with examples** — The codebase relies heavily on JSDoc examples as
   documentation (see `quartz/util/path.ts`)
3. **Module augmentation for plugins** — Extend `vfile`'s `DataMap` interface
   for plugin data
4. **Isomorphic code** — Path utilities must work in both Node.js and browser
   environments
