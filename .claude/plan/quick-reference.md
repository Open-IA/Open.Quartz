# Quick Reference: Open.Quartz Implementation Plan

**Last Updated:** 2026-03-07

## Project Status

**Completion:** ~15% (Foundation complete, core features pending)

## What's Done ✅

- Path type system (nominal typing)
- Path utilities with tests
- i18n system (30+ locales)
- CLI bootstrap (yargs)
- Configuration types
- Basic utilities (clone, ctx, sourcemap, theme, fileTrie partial)
- Plugin type definitions
- VFile augmentation
- Date component
- Example config

## What's Missing ❌

### Critical (P0 - Cannot build without these)
- Build pipeline (4 processors: parse, transform, filter, emit)
- ContentPage emitter
- ComponentResources emitter
- ContentIndex emitter
- Head, Content, PageTitle components
- renderPage function
- quartz.layout.ts
- FrontMatter, OFM, CrawlLinks transformers

### Important (P1 - Core Quartz features)
- SyntaxHighlighting, Assets, Static emitters
- FolderPage, TagPage, NotFoundPage emitters
- Search, Graph, Explorer, TableOfContents components
- FolderContent, TagContent components
- Footer component

### Nice to Have (P2 - Polish)
- GFM, Description, Latex transformers
- RemoveDrafts, ExplicitPublish filters
- Backlinks, Darkmode, Breadcrumbs components
- AliasRedirects, CNAME emitters

### Optional (P3 - Advanced features)
- Citations, OxHugo transformers
- ReaderMode, Comments components
- Favicon, CustomOgImages emitters

## Implementation Order

### Phase 1: Build Pipeline (Week 1)
```
quartz/processors/
  ├── parse.ts        ← Read Markdown, create VFiles
  ├── transform.ts    ← Apply transformers
  ├── filter.ts       ← Apply filters
  └── emit.ts         ← Generate output

quartz/build.ts       ← Wire it all together
```

### Phase 2: Transformers (Week 2)
```
quartz/plugins/transformers/
  ├── frontmatter.ts  ← Parse YAML/TOML
  ├── ofm.ts          ← Obsidian features
  ├── links.ts        ← Link processing
  └── lastmod.ts      ← Complete existing
```

### Phase 3: Emitters (Week 3)
```
quartz/plugins/emitters/
  ├── contentPage.ts       ← Generate HTML pages
  ├── componentResources.ts ← Bundle CSS/JS
  └── contentIndex.ts      ← Search index, sitemap, RSS
```

### Phase 4: Components (Week 4)
```
quartz/components/
  ├── Head.tsx         ← Page head
  ├── Content.tsx      ← Render content
  ├── PageTitle.tsx    ← Site title
  ├── Search.tsx       ← Search feature
  └── renderPage.tsx   ← Assemble pages

quartz.layout.ts       ← Define layouts
```

### Phase 5: More Features (Week 5+)
- Remaining transformers, emitters, components
- Styling system
- Interactive features

## File Count Summary

| Category | Total | Done | Missing |
|----------|-------|------|---------|
| Transformers | 11 | 1 (stub) | 10 |
| Filters | 2 | 0 | 2 |
| Emitters | 12 | 0 | 12 |
| Components | 25 | 1 | 24 |
| Processors | 4 | 0 | 4 |
| Styles | 3 | 0 | 3 |
| **TOTAL** | **57** | **2** | **55** |

## Key Dependencies

```json
{
  "vfile": "Virtual file format",
  "unified": "Markdown processing",
  "remark-parse": "MD → MDAST",
  "remark-rehype": "MDAST → HAST",
  "rehype-stringify": "HAST → HTML",
  "gray-matter": "Frontmatter",
  "toml": "TOML support",
  "preact": "Components",
  "esbuild": "Bundling",
  "glob": "File matching",
  "simple-git": "Git history"
}
```

## Success Criteria

✅ When these work, Phase 1-4 is complete:
1. `npm run quartz build` generates HTML files
2. Markdown content becomes styled HTML pages
3. Internal links work
4. Search is functional
5. Graph visualization works
6. Wiki-style `[[links]]` function

## Next Action

**Start with Phase 1, Task 1.1:** Create the processors directory and implement the parse processor.

See `detailed-task-breakdown.md` for implementation details.
