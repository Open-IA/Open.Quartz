# Detailed Task Breakdown

**Last Updated:** 2026-03-07 **Project:** Open.Quartz (Copy-learning from
jackyzha0/quartz)

## Current State Analysis

### Files Currently Implemented

```
quartz/
├── bootstrap-cli.mjs        ✅ Complete - CLI entry point with yargs
├── build.ts                 ⚠️ Skeletal - Empty functions, needs implementation
├── cfg.ts                   ✅ Complete - Configuration types
│
├── cli/                     ✅ Complete - JavaScript handlers
│   ├── args.js              ✅ Complete
│   ├── constants.js         ✅ Complete
│   ├── handlers.js          ✅ Complete
│   └── helpers.js           ✅ Complete
│
├── components/
│   └── Date.tsx             ✅ Complete - Basic date component
│   └── [20+ missing]        ❌ Not implemented
│
├── i18n/
│   ├── index.ts             ✅ Complete
│   ├── locales/             ✅ Complete - 30+ locale files
│   └── definition.ts        ✅ Complete
│
├── plugins/
│   ├── types.ts             ✅ Complete - Plugin type definitions
│   ├── vfile.ts             ✅ Complete - VFile augmentation
│   ├── transformers/
│   │   └── lastmod.ts       ⚠️ Stub - Minimal implementation
│   │   └── [10+ missing]    ❌ Not implemented
│   ├── filters/             ❌ Directory doesn't exist
│   └── emitters/            ❌ Directory doesn't exist
│
├── processors/              ❌ Directory doesn't exist
│   ├── parse.ts             ❌ Not implemented
│   ├── transform.ts         ❌ Not implemented
│   ├── filter.ts            ❌ Not implemented
│   └── emit.ts              ❌ Not implemented
│
├── styles/                  ❌ Directory doesn't exist
│   ├── base.scss            ❌ Not implemented
│   ├── custom.scss          ❌ Not implemented
│   └── index.scss           ❌ Not implemented
│
└── util/
    ├── clone.ts             ✅ Complete
    ├── ctx.ts               ✅ Complete
    ├── fileTrie.ts          ⚠️ Incomplete - Partial implementation
    ├── path.ts              ✅ Complete with tests
    ├── sourcemap.ts         ✅ Complete
    └── theme.ts             ✅ Complete

Project Root:
├── quartz.config.ts         ✅ Complete - Example config
├── quartz.layout.ts         ❌ Missing - Layout configuration
└── [content/, public/]      ✅ Standard directories
```

## Detailed Task List

### Phase 1: Build Pipeline Foundation

#### Task 1.1: Create Processors Directory Structure

- [ ] Create `quartz/processors/` directory
- [ ] Create `quartz/processors/parse.ts`
- [ ] Create `quartz/processors/transform.ts`
- [ ] Create `quartz/processors/filter.ts`
- [ ] Create `quartz/processors/emit.ts`

#### Task 1.2: Implement Parse Processor

**File:** `quartz/processors/parse.ts`

**Requirements:**

```typescript
export interface ParseOptions {
  filePath: FilePath;
  content: string;
}

export interface ParseResult {
  file: VFile;
  ast: Root;
}
```

**Implementation Steps:**

1. Import `unified`, `remark-parse`, `remark-rehype`
2. Create processor pipeline
3. Parse markdown content to MDAST
4. Convert MDAST to HAST
5. Attach to VFile
6. Return result with file path as FullSlug

#### Task 1.3: Implement Transform Processor

**File:** `quartz/processors/transform.ts`

**Requirements:**

```typescript
export interface TransformOptions {
  transformers: QuartzTransformerPluginInstance[];
  cfg: QuartzConfig;
}

export interface TransformResult {
  files: VFile[];
}
```

**Implementation Steps:**

1. Accept array of VFiles from parse stage
2. Iterate through each transformer plugin
3. Apply `textTransform`, `markdownPlugins`, `htmlPlugins` hooks
4. Update VFile data after each transformer
5. Return transformed files

#### Task 1.4: Implement Filter Processor

**File:** `quartz/processors/filter.ts`

**Requirements:**

```typescript
export interface FilterOptions {
  filters: QuartzFilterPlugin[];
}

export interface FilterResult {
  files: VFile[];
}
```

**Implementation Steps:**

1. Accept array of VFiles from transform stage
2. For each filter plugin, call `shouldPublish()`
3. Remove files where any filter returns false
4. Return filtered files

#### Task 1.5: Implement Emit Processor

**File:** `quartz/processors/emit.ts`

**Requirements:**

```typescript
export interface EmitOptions {
  emitters: QuartzEmitterPlugin[];
  cfg: QuartzConfig;
  outputDirectory: string;
}

export interface EmitResult {
  files: EmitCallbackResult[];
}
```

**Implementation Steps:**

1. Accept filtered VFiles
2. Iterate through each emitter plugin
3. Call `emit()` with files and context
4. Handle incremental builds with `partialEmit()`
5. Return emitted file paths

#### Task 1.6: Complete Build Pipeline

**File:** `quartz/build.ts`

**Implementation Steps:**

1. Create `BuildContext` with all necessary data
2. Implement glob pattern matching for content files
3. Wire up: parse → transform → filter → emit
4. Add concurrency control with `async-mutex`
5. Add progress reporting with cli-spinners
6. Implement client refresh for serve mode

---

### Phase 2: Essential Transformers

#### Task 2.1: FrontMatter Transformer

**File:** `quartz/plugins/transformers/frontmatter.ts`

**Dependencies:** `gray-matter`, `toml`

**Features:**

- Parse YAML frontmatter
- Parse TOML frontmatter (with `+++` delimiters)
- Normalize fields: title, tags, aliases, permalink, cssclasses, dates
- Handle socialImage
- Attach to `vfile.data.frontmatter`

#### Task 2.2: ObsidianFlavoredMarkdown Transformer

**File:** `quartz/plugins/transformers/ofm.ts`

**Dependencies:** `remark-wiki-link`, `remark-smartypants`, custom plugins

**Features:**

- **textTransform:** Remove Obsidian comments `%%`, preprocess callouts
- **markdownPlugins:**
  - Wikilink `[[link]]` processing
  - Tag `#tag` processing
  - Embed `![[embed]]` processing
- **htmlPlugins:**
  - Callout/admonition rendering
  - Block reference `^blockid` extraction
  - YouTube embed conversion

#### Task 2.3: CrawlLinks Transformer

**File:** `quartz/plugins/transformers/links.ts`

**Dependencies:** `unist-util-visit`

**Features:**

- Detect internal links (to content)
- Detect external links (to other sites)
- Rewrite markdown paths to proper URLs
- Add external link icons
- Create "pretty" links (display title instead of URL)
- Attach link graph to `vfile.data.links`

#### Task 2.4: Complete CreatedModifiedDate Transformer

**File:** `quartz/plugins/transformers/lastmod.ts` (update existing)

**Dependencies:** `simple-git`

**Features:**

- Check frontmatter dates first
- Fall back to git history
- Fall back to filesystem timestamps
- Configurable priority order
- Attach to `vfile.data.dates`

---

### Phase 3: Essential Emitters

#### Task 3.1: Create Emitters Directory Structure

- [ ] Create `quartz/plugins/emitters/` directory
- [ ] Create `quartz/plugins/emitters/index.ts`

#### Task 3.2: ContentPage Emitter

**File:** `quartz/plugins/emitters/contentPage.ts`

**Dependencies:** Components, `jsx-runtime`, `preact`

**Features:**

- Generate HTML for each content file
- Use layout configuration
- Render with Preact
- Write to output directory
- Handle permalinks
- Declare used components for `getQuartzComponents()`

#### Task 3.3: ComponentResources Emitter

**File:** `quartz/plugins/emitters/componentResources.ts`

**Dependencies:** `esbuild`

**Features:**

- Collect CSS from all used components
- Collect JS (beforeDOMLoaded) from all used components
- Collect JS (afterDOMLoaded) from all used components
- Bundle with esbuild
- Emit `index.css`, `prescript.js`, `postscript.js`
- Handle Google Fonts if configured

#### Task 3.4: ContentIndex Emitter

**File:** `quartz/plugins/emitters/contentIndex.ts`

**Dependencies:** None (JSON generation)

**Features:**

- Generate `static/contentIndex.json` for search
- Optional: Generate `sitemap.xml`
- Optional: Generate `rss.xml` with RSS feed
- Include all published pages

---

### Phase 4: Core Components

#### Task 4.1: Create Component Infrastructure

**File:** `quartz/components/index.ts`

**Requirements:**

```typescript
export type QuartzComponentConstructor<Options = undefined> = (
  opts?: Options
) => QuartzComponent;

export interface QuartzComponentProps {
  ctx: BuildContext;
  fileData: QuartzPluginData;
  cfg: QuartzConfig;
  tree: HastElement;
  allFiles: QuartzPluginData[];
}
```

#### Task 4.2: Head Component

**File:** `quartz/components/Head.tsx`

**Features:**

- Meta tags (charset, viewport, description, og:\*)
- Page title
- CSS resources link
- Inline CSS
- Script resources
- Analytics injection

#### Task 4.3: Content Component

**File:** `quartz/components/Content.tsx`

**Dependencies:** `hast-util-to-jsx-runtime`

**Features:**

- Convert HAST to JSX
- Apply frontmatter CSS classes
- Render article content
- Handle data attributes

#### Task 4.4: PageTitle Component

**File:** `quartz/components/PageTitle.tsx`

**Features:**

- Display site title
- Link to home page
- Optional suffix

#### Task 4.5: Search Component

**File:** `quartz/components/Search.tsx`

**Dependencies:** Flexsearch or similar

**Features:**

- Search input box
- Display search results
- Highlight matches
- Client-side search logic

#### Task 4.6: renderPage Function

**File:** `quartz/components/renderPage.tsx`

**Features:**

- Assemble Head, Body components
- Apply layout structure
- Render to HTML string
- Inject into `<html>` and `<body>` tags

#### Task 4.7: Layout Configuration

**File:** `quartz.layout.ts`

**Features:**

- Define default page layout
- Define component order
- Support before/after body content

---

### Phase 5: Important Features

#### Task 5.1: SyntaxHighlighting Transformer

**File:** `quartz/plugins/transformers/syntax.ts`

**Dependencies:** `rehype-pretty-code`

**Features:**

- Code block detection
- Apply syntax highlighting
- Support dual themes (light/dark)
- Optional background preservation

#### Task 5.2: Assets Emitter

**File:** `quartz/plugins/emitters/assets.ts`

**Features:**

- Copy non-Markdown files from content
- Preserve directory structure
- Handle images, PDFs, etc.

#### Task 5.3: Static Emitter

**File:** `quartz/plugins/emitters/static.ts`

**Features:**

- Copy files from `quartz/static/`
- Copy to `public/static/`

#### Task 5.4: FolderPage Emitter + FolderContent Component

**Files:**

- `quartz/plugins/emitters/folderPage.ts`
- `quartz/components/FolderContent.tsx`

**Features:**

- Generate pages for each folder
- Show subfolders
- Show files in folder
- Use FileTrie for navigation

#### Task 5.5: TagPage Emitter + TagContent Component

**Files:**

- `quartz/plugins/emitters/tagPage.ts`
- `quartz/components/TagContent.tsx`

**Features:**

- Generate pages for each tag
- List all content with tag
- Tag index page

#### Task 5.6: NotFoundPage Emitter + NotFound Component

**Files:**

- `quartz/plugins/emitters/404.ts`
- `quartz/components/NotFound.tsx`

**Features:**

- Generate `404.html`
- Display error message
- Link back to home

#### Task 5.7: Graph Component

**File:** `quartz/components/Graph.tsx`

**Dependencies:** Graph visualization library (d3, vis-network, etc.)

**Features:**

- Display link graph
- Local graph (current page)
- Global graph (all pages)
- Interactive navigation

#### Task 5.8: Explorer Component

**File:** `quartz/components/Explorer.tsx`

**Features:**

- File/folder tree view
- Expand/collapse folders
- Custom sorting
- Local storage persistence

#### Task 5.9: TableOfContents Transformer + Component

**Files:**

- `quartz/plugins/transformers/toc.ts`
- `quartz/components/TableOfContents.tsx`

**Features:**

- Extract headings from content
- Generate TOC data
- Display interactive TOC
- Highlight current section

#### Task 5.10: Footer Component

**File:** `quartz/components/Footer.tsx`

**Features:**

- Copyright info
- External links
- Optional custom content

---

### Phase 6: Styling

#### Task 6.1: Create Styles Directory

- [ ] Create `quartz/styles/` directory

#### Task 6.2: Base Styles

**File:** `quartz/styles/base.scss`

**Features:**

- Typography
- Reset/normalize
- Layout basics
- Component styles
- Print styles

#### Task 6.3: Index Styles

**File:** `quartz/styles/index.scss`

**Features:**

- Import base styles
- Import theme variables
- Global style exports

#### Task 6.4: Custom Styles

**File:** `quartz/styles/custom.scss`

**Features:**

- User customization placeholder
- Override base styles

---

## File-by-File Implementation Order

### Immediate Next Steps (Priority Order)

1. **quartz/processors/parse.ts** - Foundation for reading content
2. **quartz/processors/transform.ts** - Transformer runtime
3. **quartz/processors/filter.ts** - Filter runtime
4. **quartz/processors/emit.ts** - Emitter runtime
5. **quartz/build.ts** - Wire it all together
6. **quartz/plugins/transformers/frontmatter.ts** - Parse metadata
7. **quartz/plugins/transformers/ofm.ts** - Core Obsidian features
8. **quartz/plugins/transformers/links.ts** - Link processing
9. **quartz/plugins/emitters/contentPage.ts** - Generate HTML
10. **quartz/components/Head.tsx** - Page head
11. **quartz/components/Content.tsx** - Render content
12. **quartz/components/renderPage.tsx** - Page assembly
13. **quartz.layout.ts** - Layout definition

---

## Testing Strategy

### Unit Tests

- Continue pattern: colocated `*.test.ts` files
- Use Node.js built-in test runner
- Test utilities, transformers, emitters

### Integration Tests

- Test full build pipeline
- Test with sample content
- Verify output HTML

### End-to-End Tests

- Build a complete site
- Verify all pages generate
- Test navigation and links

---

## Notes

- **DO NOT** edit files by yourself - this is a copy-learning project
- Focus on understanding architecture over speed
- Reference original Quartz for implementation details
- Keep code well-commented with educational notes
- Update this plan as you progress
