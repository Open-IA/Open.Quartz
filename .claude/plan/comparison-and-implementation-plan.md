# Quartz vs Open.Quartz: Comparison and Implementation Plan

**Date:** 2026-03-07 **Status:** Initial Planning **Project:** Open.Quartz
(Copy-learning project based on jackyzha0/quartz)

## Executive Summary

This document provides a comprehensive comparison between the original
[jackyzha0/quartz](https://github.com/jackyzha0/quartz) and this copy-learning
project (Open.Quartz). The goal is to identify what has been implemented, what
is missing, and create a roadmap for completing the static site generator.

## Architecture Overview

### What is Quartz?

Quartz is a fast, batteries-included static site generator that transforms
Markdown content into fully functional websites. Key features include:

- Obsidian Flavored Markdown support
- Wiki-style linking and graph visualization
- Full-text search
- SPA navigation
- Customizable themes
- Extensible plugin architecture

### Original Quartz Directory Structure

```
quartz/
├── bootstrap-cli.mjs      # CLI entry point
├── cfg.ts                 # Configuration types
├── build.ts               # Build orchestration
├── cli/                   # CLI handlers and utilities
│   ├── args.js
│   ├── constants.js
│   ├── handlers.js
│   └── helpers.js
├── components/            # JSX components for rendering
│   ├── index.ts
│   ├── renderPage.tsx
│   ├── ArticleTitle.tsx
│   ├── Backlinks.tsx
│   ├── Breadcrumbs.tsx
│   ├── Comments.tsx
│   ├── Content.tsx
│   ├── ContentMeta.tsx
│   ├── Darkmode.tsx
│   ├── Date.tsx
│   ├── DesktopOnly.tsx
│   ├── Explorer.tsx
│   ├── Flex.tsx
│   ├── Footer.tsx
│   ├── FolderContent.tsx
│   ├── Graph.tsx
│   ├── Head.tsx
│   ├── MobileOnly.tsx
│   ├── NotFound.tsx
│   ├── PageList.tsx
│   ├── PageTitle.tsx
│   ├── ReaderMode.tsx
│   ├── Search.tsx
│   ├── Spacer.tsx
│   ├── TableOfContents.tsx
│   ├── TagContent.tsx
│   └── TagList.tsx
├── i18n/                  # Internationalization (30+ locales)
│   ├── index.ts
│   └── locales/
├── plugins/               # Plugin system
│   ├── types.ts
│   ├── transformers/      # Content transformation plugins
│   │   ├── citations.ts
│   │   ├── description.ts
│   │   ├── frontmatter.ts
│   │   ├── gfm.ts
│   │   ├── index.ts
│   │   ├── lastmod.ts
│   │   ├── latex.ts
│   │   ├── links.ts
│   │   ├── ofm.ts
│   │   ├── oxhugofm.ts
│   │   ├── syntax.ts
│   │   └── toc.ts
│   ├── filters/           # Content filtering plugins
│   │   ├── explicit.ts
│   │   └── draft.ts
│   └── emitters/          # File generation plugins
│       ├── aliasRedirects.ts
│       ├── assets.ts
│       ├── cname.ts
│       ├── componentResources.ts
│       ├── contentIndex.ts
│       ├── contentPage.ts
│       ├── folderPage.ts
│       ├── static.ts
│       ├── tagPage.ts
│       ├── 404.ts
│       ├── favicon.ts
│       └── ogImages.ts
├── processors/            # Build pipeline processors
│   ├── emit.ts
│   ├── filter.ts
│   ├── parse.ts
│   └── transform.ts
├── styles/                # SCSS styles
│   ├── base.scss
│   ├── custom.scss
│   └── index.scss
└── util/                  # Utilities
    ├── theme.ts
    ├── path.ts
    ├── sourcemap.ts
    ├── ctx.ts
    ├── clone.ts
    └── fileTrie.ts
```

## Implementation Status

### ✅ Completed (Foundation)

| Module              | Status      | Notes                                                                           |
| ------------------- | ----------- | ------------------------------------------------------------------------------- |
| Path Type System    | ✅ Complete | Nominal typing with branded types (FilePath, FullSlug, SimpleSlug, RelativeURL) |
| Path Utilities      | ✅ Complete | Full set of path manipulation functions with comprehensive tests                |
| i18n System         | ✅ Complete | 30+ locales with type definitions                                               |
| VFile Augmentation  | ✅ Complete | Module augmentation for plugin data                                             |
| Plugin Types        | ✅ Complete | Basic types for QuartzTransformerPlugin                                         |
| CLI Bootstrap       | ✅ Complete | Yargs setup with command routing                                                |
| Configuration Types | ✅ Complete | GlobalConfiguration and QuartzConfig                                            |
| Utility Functions   | ✅ Complete | clone, ctx, fileTrie, sourcemap, theme                                          |
| Date Component      | ✅ Complete | Basic date rendering component                                                  |

### ⚠️ Partial (Skeletal)

| Module              | Status      | Notes                                  |
| ------------------- | ----------- | -------------------------------------- |
| Build Pipeline      | ⚠️ Skeletal | `build.ts` exists but empty functions  |
| CLI Handlers        | ⚠️ Skeletal | Handler stubs exist                    |
| Plugin System       | ⚠️ Partial  | Types exist, no runtime implementation |
| Lastmod Transformer | ⚠️ Stub     | File exists but minimal implementation |

### ❌ Not Implemented

#### Transformer Plugins (11 missing)

| Plugin                     | Priority | Description                                      |
| -------------------------- | -------- | ------------------------------------------------ |
| `ObsidianFlavoredMarkdown` | P0       | Core feature - wikilinks, callouts, tags, embeds |
| `FrontMatter`              | P0       | Parses YAML/TOML frontmatter                     |
| `SyntaxHighlighting`       | P1       | Code highlighting with rehype-pretty-code        |
| `CrawlLinks`               | P0       | Internal/external link processing                |
| `TableOfContents`          | P1       | Generates TOC from headings                      |
| `Description`              | P2       | SEO description generation                       |
| `GitHubFlavoredMarkdown`   | P1       | GFM support                                      |
| `Latex`                    | P2       | Math rendering (KaTeX/MathJax)                   |
| `Citations`                | P3       | Academic citation support                        |
| `OxHugoFlavouredMarkdown`  | P3       | ox-hugo compatibility                            |

#### Filter Plugins (2 missing)

| Plugin            | Priority | Description                            |
| ----------------- | -------- | -------------------------------------- |
| `RemoveDrafts`    | P1       | Filter out draft content               |
| `ExplicitPublish` | P2       | Only publish explicitly marked content |

#### Emitter Plugins (12 missing)

| Plugin               | Priority | Description                                |
| -------------------- | -------- | ------------------------------------------ |
| `ContentPage`        | P0       | Generate HTML pages for each Markdown file |
| `ComponentResources` | P0       | Bundle CSS/JS from components              |
| `Assets`             | P1       | Copy non-Markdown files                    |
| `Static`             | P1       | Copy static files from quartz/static       |
| `ContentIndex`       | P0       | Generate content index for search          |
| `AliasRedirects`     | P2       | Generate redirect pages                    |
| `FolderPage`         | P1       | Generate folder listing pages              |
| `TagPage`            | P1       | Generate tag aggregation pages             |
| `NotFoundPage`       | P1       | Generate 404 page                          |
| `Favicon`            | P3       | Generate favicon.ico                       |
| `CNAME`              | P2       | Create CNAME file for deployment           |
| `CustomOgImages`     | P3       | Generate social media preview images       |

#### Components (20+ missing)

| Component         | Priority | Description                         |
| ----------------- | -------- | ----------------------------------- |
| `Content`         | P0       | Render markdown content             |
| `Head`            | P0       | HTML head section                   |
| `PageTitle`       | P0       | Main page title                     |
| `Search`          | P0       | Client-side search                  |
| `Graph`           | P1       | Interactive graph visualization     |
| `Explorer`        | P1       | File/folder navigation              |
| `TableOfContents` | P1       | Page TOC display                    |
| `Backlinks`       | P1       | Show pages linking to current       |
| `Darkmode`        | P2       | Theme toggle                        |
| `Footer`          | P1       | Page footer                         |
| `Breadcrumbs`     | P2       | Navigation trail                    |
| `ArticleTitle`    | P2       | Article heading                     |
| `TagList`         | P2       | Render page tags                    |
| `ContentMeta`     | P3       | Reading time, word count            |
| `FolderContent`   | P1       | Folder listing content              |
| `TagContent`      | P1       | Tag page content                    |
| `NotFound`        | P1       | 404 page content                    |
| `Comments`        | P3       | Giscus integration                  |
| `ReaderMode`      | P3       | Reader view toggle                  |
| Layout components | P2       | Flex, MobileOnly, DesktopOnly, etc. |

#### Build Pipeline (4 missing processors)

| Processor   | Priority | Description               |
| ----------- | -------- | ------------------------- |
| `parse`     | P0       | Parse Markdown to AST     |
| `transform` | P0       | Apply transformer plugins |
| `filter`    | P0       | Apply filter plugins      |
| `emit`      | P0       | Generate output files     |

#### Other Missing

| Module             | Priority | Description                  |
| ------------------ | -------- | ---------------------------- |
| `renderPage.tsx`   | P0       | Page rendering assembly      |
| `styles/`          | P1       | SCSS styling system          |
| `quartz.layout.ts` | P0       | Layout configuration         |
| `processors/`      | P0       | Build pipeline orchestration |

## Implementation Roadmap

### Phase 1: Core Build Pipeline (Foundation)

**Goal:** Get a basic Markdown → HTML pipeline working

1. **Parse Processor** (`quartz/processors/parse.ts`)

   - Read Markdown files from content directory
   - Parse to unified AST using remark/rehype
   - Extract file metadata

2. **Transform Processor** (`quartz/processors/transform.ts`)

   - Apply transformer plugins sequentially
   - Implement plugin runtime

3. **Filter Processor** (`quartz/processors/filter.ts`)

   - Apply filter plugins
   - Remove unpublished content

4. **Emit Processor** (`quartz/processors/emit.ts`)

   - Run emitter plugins
   - Generate output files

5. **Complete Build Pipeline** (`quartz/build.ts`)
   - Wire up all processors
   - Add concurrency control
   - Add progress reporting

### Phase 2: Essential Transformers (P0)

**Goal:** Transform raw Markdown into enriched content

1. **FrontMatter Plugin** (`quartz/plugins/transformers/frontmatter.ts`)

   - Parse YAML/TOML frontmatter
   - Normalize fields (title, tags, aliases, dates, etc.)

2. **ObsidianFlavoredMarkdown Plugin** (`quartz/plugins/transformers/ofm.ts`)

   - Wikilink processing `[[link]]`
   - Callout/admonition support
   - Tag processing `#tag`
   - Embeds `![[embed]]`
   - Block references `^blockid`

3. **CrawlLinks Plugin** (`quartz/plugins/transformers/links.ts`)

   - Internal link resolution
   - External link detection
   - Pretty links
   - Link icons

4. **CreatedModifiedDate Plugin** (Complete existing stub)
   - Git history parsing
   - Filesystem timestamps
   - Frontmatter priority

### Phase 3: Essential Emitters (P0)

**Goal:** Generate HTML output

1. **ContentPage Emitter** (`quartz/plugins/emitters/contentPage.ts`)

   - Generate HTML for each Markdown file
   - Apply page layout
   - Inject component resources

2. **ComponentResources Emitter**
   (`quartz/plugins/emitters/componentResources.ts`)

   - Collect component CSS
   - Collect component JS (beforeDOMLoaded, afterDOMLoaded)
   - Bundle resources

3. **ContentIndex Emitter** (`quartz/plugins/emitters/contentIndex.ts`)
   - Generate content index JSON
   - Optional sitemap.xml
   - Optional RSS feed

### Phase 4: Core Components (P0)

**Goal:** Render pages with Quartz layout

1. **Head Component** (`quartz/components/Head.tsx`)

   - Meta tags
   - Title
   - CSS resources
   - JS resources

2. **Content Component** (`quartz/components/Content.tsx`)

   - Render HAST as JSX
   - Apply frontmatter CSS classes

3. **PageTitle Component** (`quartz/components/PageTitle.tsx`)

   - Site title with home link

4. **Search Component** (`quartz/components/Search.tsx`)

   - Search input
   - Client-side search logic

5. **renderPage Function** (`quartz/components/renderPage.tsx`)

   - Assemble components into HTML
   - Apply layout structure

6. **Layout Configuration** (`quartz.layout.ts`)
   - Define default layout
   - Page type layouts

### Phase 5: Important Features (P1)

**Goal:** Add essential Quartz features

1. **SyntaxHighlighting Plugin**
2. **Assets Emitter** - Copy images, PDFs, etc.
3. **Static Emitter** - Copy quartz/static files
4. **FolderPage Emitter** + FolderContent Component
5. **TagPage Emitter** + TagContent Component
6. **NotFoundPage Emitter** + NotFound Component
7. **Graph Component** - Interactive graph view
8. **Explorer Component** - File navigation
9. **TableOfContents Plugin** + Component
10. **Footer Component**

### Phase 6: Polish & Enhancements (P2-P3)

**Goal:** Complete remaining features

1. RemoveDrafts & ExplicitPublish filters
2. GitHubFlavoredMarkdown plugin
3. Backlinks Component
4. Darkmode Component
5. Breadcrumbs Component
6. AliasRedirects Emitter
7. CNAME Emitter
8. Description Plugin
9. Latex Plugin
10. ReaderMode, Comments, other components

### Phase 7: Styling & Theming

1. **Base Styles** (`quartz/styles/base.scss`)

   - Typography
   - Layout
   - Component styles

2. **Theme System** (Already have theme.ts)

   - Light/dark mode
   - Color schemes
   - Font configuration

3. **Custom Styles** (`quartz/styles/custom.scss`)
   - User customization

## Development Guidelines

### File Organization

- Keep transformers, filters, and emitters in their respective directories
- Each plugin should be in its own file
- Use `index.ts` files to re-export plugins
- Keep utilities in `quartz/util/`

### Type Safety

- Always use type guard functions before casting to path types
- Use the nominal typing system for paths
- Extend VFile DataMap for plugin data
- Maintain JSDoc examples for all utilities

### Testing

- Write tests for utilities (colocated with source)
- Use Node.js built-in test runner with tsx
- Test plugin functionality with sample content

### Build Order

Transformers run sequentially, order matters:

1. FrontMatter (first - parses metadata)
2. CreatedModifiedDate (uses frontmatter)
3. SyntaxHighlighting
4. ObsidianFlavoredMarkdown (core content transforms)
5. GitHubFlavoredMarkdown
6. TableOfContents
7. CrawlLinks (needs processed content)
8. Description (needs processed content)
9. Latex

## Dependencies

Key npm packages used by Quartz:

- `vfile` - Virtual file format
- `unified` - Markdown processing
- `remark` - Markdown AST parser
- `rehype` - HTML AST processor
- `hast` - HTML AST types
- `unist` - Universal AST types
- `remark-rehype` - Convert MD to HTML AST
- `rehype-stringify` - Convert AST to HTML
- `rehype-pretty-code` - Syntax highlighting
- `remark-math` - LaTeX in Markdown
- `rehype-katex` / `rehype-mathjax` - LaTeX rendering
- `yargs` - CLI parsing
- `chalk` / `cli-spinners` - CLI output
- `glob` - File pattern matching
- `gray-matter` - Frontmatter parsing
- `toml` - TOML frontmatter support
- `esbuild` - Bundling
- `preact` - Component framework

## Success Criteria

The Open.Quartz project will be considered complete when:

1. ✅ All path types and utilities are implemented
2. ✅ All i18n locales are available
3. ✅ Basic build pipeline works (Markdown → HTML)
4. ✅ Core transformer plugins (FrontMatter, OFM, CrawlLinks, Lastmod)
5. ✅ Core emitter plugins (ContentPage, ComponentResources, ContentIndex)
6. ✅ Core components (Head, Content, PageTitle, Search)
7. ✅ Layout system works
8. ✅ Can build a basic website with content pages
9. ✅ Interactive features (graph, explorer, search) work
10. ✅ CLI commands work (create, build, serve)

## Next Steps

1. Start with Phase 1: Core Build Pipeline
2. Implement Parse Processor
3. Implement Transform Processor with plugin runtime
4. Implement Filter Processor
5. Implement Emit Processor
6. Wire everything up in build.ts

---

**Note:** This is a copy-learning project. The goal is educational - to
understand static site generator architecture by rebuilding Quartz step-by-step.
Take time to understand each component before implementing.
