# 🌱 Open.Quartz

> A learning journey through Quartz - rebuilding a fast, batteries-included
> static-site generator from the ground up.

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Node](https://img.shields.io/badge/Node-22%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

[About](#-about) • [Features](#-features) • [Progress](#-progress) •
[Usage](#-usage) • [Learning](#-learning)

</div>

---

## 📖 About

**Open.Quartz** is a **copy-learning project** based on
[jackyzha0/quartz](https://github.com/jackyzha0/quartz) — a fast,
batteries-included static-site generator that transforms Markdown content into
fully functional websites.

This project is an educational endeavor to understand the internals of Quartz by
rebuilding it step-by-step, documenting the learning process, and gaining deep
insights into static-site generation, TypeScript architecture, and modern web
development practices.

### 🎯 Learning Goals

- Understand static-site generator architecture
- Master TypeScript advanced typing patterns (nominal types, type guards)
- Learn build pipeline design with esbuild
- Explore plugin architecture and extensibility
- Study internationalization (i18n) implementation
- Deep dive into CLI design patterns

---

## ✨ Features

Based on the original Quartz, this project aims to implement:

- 📝 **Obsidian Compatibility** - Full support for Obsidian-flavored Markdown
- 🔍 **Full-text Search** - Built-in search functionality
- 🕸️ **Graph View** - Visualize note connections
- 🔗 **Wikilinks & Backlinks** - Networked thought support
- 🎨 **Simple JSX Layouts** - Customizable page components
- ⚡ **Hot Reload** - Incremental rebuilds for content edits
- 🌍 **Internationalization** - Support for 30+ languages
- 🐳 **Docker Support** - Containerized deployment

---

## 🚧 Progress

> **Current Status**: 🚧 Early Development Phase

### ✅ Implemented

| Component          | Status      | Description                                                                         |
| ------------------ | ----------- | ----------------------------------------------------------------------------------- |
| **Path Utilities** | ✅ Complete | Nominal types for path safety (`FullSlug`, `SimpleSlug`, `FilePath`, `RelativeURL`) |
| **CLI Commands**   | ✅ Partial  | `create`, `sync`, `restore`, `build` commands                                       |
| **Build Pipeline** | ✅ Partial  | esbuild integration with cache busting                                              |
| **Type System**    | ✅ Complete | Plugin data type augmentation                                                       |
| **i18n System**    | ✅ Complete | 30+ locale definitions                                                              |
| **Testing**        | ✅ Partial  | Unit tests for path utilities                                                       |

### 🔄 In Progress

- Content transformation pipeline
- Plugin architecture implementation
- Component rendering system
- Configuration management

### 📋 Planned

- [ ] Search functionality
- [ ] Graph visualization
- [ ] SPA navigation
- [ ] Popover previews
- [ ] Theme system

---

## 🛠️ Usage

### 📋 Prerequisites

- **Node.js** v22 or higher
- **npm** v10.9.2 or higher

### 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/Open-IA/Open.Quartz.git
cd Open.Quartz

# Install dependencies
npm install
```

### 🚀 Available Commands

```bash
# Create a new Quartz site
npm run quartz create

# Build the site
npm run quartz build

# Sync with remote
npm run quartz sync

# Restore dependencies
npm run quartz restore

# Run tests
npm test
```

---

## 📚 Learning Documentation

Detailed learning notes are maintained in the [devlogs](./devlogs/) directory:

- [2025-12-15] - Project entrypoint and setup
- [2025-12-16] - Command `create` implementation
- [2025-12-26] - Command `update` implementation
- [2026-01-04] - Command `sync` implementation
- [2026-02-06] - Command `build` implementation

---

## 🏗️ Architecture

```
quartz/
├── bootstrap-cli.mjs    # CLI entry point
├── build.ts             # Build pipeline
├── cfg.ts               # Configuration management
├── i18n/                # Internationalization
│   ├── index.ts
│   └── locales/         # 30+ locale files
├── plugins/             # Plugin system
│   ├── types.ts
│   ├── vfile.ts
│   └── transformers/
├── util/                # Utilities
│   ├── path.ts          # Path utilities with nominal types
│   ├── path.test.ts     # Unit tests
│   ├── clone.ts
│   ├── ctx.ts
│   └── theme.ts
```

---

## 🧪 Type System

This project uses **nominal typing** to prevent common path-related bugs:

```typescript
// Different path types are not interchangeable
type FullSlug = string & { __brand: "full" };
type SimpleSlug = string & { __brand: "simple" };
type FilePath = string & { __brand: "filepath" };
type RelativeURL = string & { __brand: "relative" };

// Type guards ensure type safety
isFullSlug("index"); // => true
isFullSlug("./abc/def"); // => false (relative path)
```

---

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

- Feel free to open issues for questions or discussions
- Pull requests for improvements are appreciated

---

## 📜 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **Original Quartz** - [jackyzha0/quartz](https://github.com/jackyzha0/quartz)
- **Community** - Thanks to the thousands of students, developers, and teachers
  using Quartz

---

## 📊 Project Stats

<div align="center">

![Lines of Code](https://img.shields.io/badge/Code-Lines-blue)
![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-blue)
![Learning](https://img.shields.io/badge/Status-Learning-green)

</div>

---

<p align="center">
  <i>"The best way to learn is to build." - Unknown</i>
</p>
