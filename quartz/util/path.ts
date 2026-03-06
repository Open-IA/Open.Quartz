import { slug as slugAnchor } from "github-slugger";
import type { Element as HastElement } from "hast";
import { clone } from "./clone";

// This file must be isomorphic (between node and browser) so it can't use node
// libraries like 'path'

/**
 * Get file or url extensions.
 *
 * @example
 * ```ts
 * getFileExtension("index.html")           // => ".html"
 * getFileExtension("https://example.com")  // => ".com"
 * getFileExtension("test")                 // => undefined
 * getFileExtension("test.md")              // => ".md"
 * getFileExtension("archive.tar.gz")       // => ".gz"
 * ```
 */
export function getFileExtension(s: string): string | undefined {
  return s.match(/\.[A-Za-z0-9]+$/)?.[0];
}

/**
 * Use `getFileExtension` function to check whether a string has an extension
 *
 * @example
 * ```ts
 * _hasFileExtension("index.html")          // => true
 * _hasFileExtension("https://example.com") // => true
 * _hasFileExtension("test")                // => false
 * _hasFileExtension("test.md")             // => true
 * _hasFileExtension("")                    // => false
 * ```
 */
function _hasFileExtension(s: string): boolean {
  return getFileExtension(s) !== undefined;
}

/**
 * This function will be only used in type guard function `isFullSlug` and
 * `isSimpleSlug`. These forbidden characters are used in URL parameters.
 *
 * @example
 * ```ts
 * // Contains forbidden characters (returns true)
 * containsForbiddenCharacters("test space")              // => true : contains space
 * containsForbiddenCharacters("index#test")              // => true : contains '#'
 * containsForbiddenCharacters("index?query=1")           // => true : contains '?'
 * containsForbiddenCharacters("index%3Fquery=1&space=3") // => true : contains '&'
 *
 * // Clean strings (returns false)
 * containsForbiddenCharacters("abc-def")    // => false
 * containsForbiddenCharacters("abc/def")    // => false
 * containsForbiddenCharacters("test.pdf")   // => false
 * ```
 */
function containsForbiddenCharacters(s: string): boolean {
  return s.includes(" ") || s.includes("#") || s.includes("?") || s.includes("&");
}

/**
 * Notice this function is not same to `String.prototype.endsWith`. It checks
 * whether the path ends with `/ + suffix`.
 *
 * @example
 * ```ts
 * // Direct match
 * endsWith("index", "index")      // => true
 *
 * // Ends with "/suffix"
 * endsWith("abc/index", "index")  // => true
 * endsWith("abc/def", "index")    // => false
 * endsWith("index/", "index")     // => false
 * ```
 */
export function endsWith(s: string, suffix: string): boolean {
  return s === suffix || s.endsWith("/" + suffix);
}

// Utility type to simulate **nominal type** in TypeScript. Paths are pretty complex
// to reason about, because especially for a static site generator, they can
// come from so many places.
//
// A full path to a piece of content is a path, but a slug for a piece of content
// yet is another path. It would be silly to type these all as 'string' can call
// it a day as it's pretty common to accidentally mistake one type of path for
// another.
//
// Unfortunately, TypeScript does not have 'nominal types' for type aliases
// meaning even if you made custom types of a server-side slug of client-side slug,
// you can still accidentally assign one to another and TypeScript wouldn't
// catch that. Luckily, we can mimic nominal types using brands.
//
// https://www.typescriptlang.org/play/#example/nominal-typing
//
// While this prevents most typing mistakes within our nominal typing system,
// it doesn't prevent us from accidentally mistaking a string for a client slug
// when we forcibly cast it.
type SlugLike<T> = string & { __brand: T };

/**
 * Cannot be relative and must have a file extension. 'FilePath' is a real file
 * path on disk.
 */
export type FilePath = SlugLike<"filepath">;
/**
 * Otherwise after casting by this type guard function, normal 'string' type cannot
 * be assigned to 'FilePath' parameter.
 * 
 * @example
 * ```
 * isFilePath("content/index.md") // => true
 * isFilePath("content/test.png") // => true
 * isFilePath("../test.pdf")      // => false : relative path
 * isFilePath("content/test")     // => false : no extension
 * isFilePath("./content.test")   // => false : relative path
 * ```
 */
export function isFilePath(s: string): s is FilePath {
  const validateStart = !s.startsWith(".");
  return validateStart && _hasFileExtension(s);
}

/**
 * Cannot be relative and may not have leading or trailing slashes. It can have
 * 'index' as its last segment. Use this wherever possible is it's the most
 * 'general' interpretation of a slug.
 */
export type FullSlug = SlugLike<"full">;
/**
 * Otherwise after casting by this type guard function, normal 'string' type cannot
 * be assigned to 'FullSlug' parameter.
 *
 * @example
 * ```ts
 * // Valid FullSlug (returns true)
 * isFullSlug("index")          // => true
 * isFullSlug("abc/def")        // => true
 * isFullSlug("html.energy")    // => true
 * isFullSlug("test.pdf")       // => true
 *
 * // Invalid FullSlug (returns false)
 * isFullSlug(".")                // => false : relative path
 * isFullSlug("./abc/def")        // => false : relative path
 * isFullSlug("../abc/def")       // => false : relative path
 * isFullSlug("abc/def#anchor")   // => false : contains '#'
 * isFullSlug("abc/def?query=1")  // => false : contains '?'
 * isFullSlug("note with spaces") // => false : contains spaces
 * ```
 */
export function isFullSlug(s: string): s is FullSlug {
  const validateStart = !(s.startsWith(".") || s.startsWith("/"));
  const validateEnding = !s.endsWith("/");
  return validateStart && validateEnding && !containsForbiddenCharacters(s);
}

/**
 * Shouldn't be a relative path and shouldn't have `/index` as an ending or a
 * file extension. It _can_ however have a trailing slash to indicate a folder
 * path.
 */
export type SimpleSlug = SlugLike<"simple">;
/**
 * otherwise after casting by this type guard function, normal 'string' type cannot
 * be assigned to 'simpleslug' parameter.
 * 
 * @example
 * ```
 * isSimpleSlug("")                     // => true
 * isSimpleSlug("abc")                  // => true
 * isSimpleSlug("abc/")                 // => true
 * isSimpleSlug("notindex")             // => true
 * isSimpleSlug("notindex/def")         // => true
 * isSimpleSlug("//")                   // => false : begin with slash
 * isSimpleSlug("index")                // => false : equal to "index"
 * isSimpleSlug("https://example.com")  // => false : extension ".com"
 * isSimpleSlug("/abc")                 // => false : begin with slash + end with "index"
 * isSimpleSlug("abc/index")            // => false : end with "index"
 * isSimpleSlug("abc#anchor")           // => false : special "#"
 * isSimpleSlug("abc?query=1")          // => false : special "?"
 * isSimpleSlug("index.md")             // => false : extension ".md"
 * isSimpleSlug("index.html")           // => false : extension ".html"
 * ```
 */
export function isSimpleSlug(s: string): s is SimpleSlug {
  const validateStart = !(s.startsWith(".") || (s.length > 1 && s.startsWith("/")));
  const validateEnding = !endsWith(s, "index");
  return validateStart && !containsForbiddenCharacters(s) && validateEnding && !_hasFileExtension(s);
}

/**
 * Can be found on `href`s but can also be constructed for client-side navigation
 * (e.g. search and graph).
 */
export type RelativeURL = SlugLike<"relative">;
/**
 * Otherwise after casting by this type guard function, normal 'string' type cannot
 * be assigned to 'RelativeURL' parameter.
 *
 * @example
 * ```ts
 * // Valid RelativeURL (returns true)
 * isRelativeURL(".")                         // => true
 * isRelativeURL("..")                        // => true
 * isRelativeURL("./abc/def")                 // => true
 * isRelativeURL("./abc/def#an-anchor")       // => true
 * isRelativeURL("./abc/def?query=1#anchor")  // => true
 * isRelativeURL("../abc/def")                // => true
 * isRelativeURL("./abc/def.pdf")             // => true
 *
 * // Invalid RelativeURL (returns false)
 * isRelativeURL("abc")               // => false : doesn't start with '.'
 * isRelativeURL("/abc/def")          // => false : absolute path
 * isRelativeURL("")                  // => false : empty string
 * isRelativeURL("./abc/def.html")    // => false : HTML extension
 * isRelativeURL("./abc/def.md")      // => false : Markdown extension
 * ```
 */
export function isRelativeURL(s: string): s is RelativeURL {
  const validateStart = /^\.{1,2}/.test(s);
  const validateEnding = !endsWith(s, "index");
  return validateStart && validateEnding && ![".md", ".html"].includes(getFileExtension(s) ?? "");
}

/**
 * `isAbsoluteURL` uses `URL` constructor function to check an URL is absolute.
 *
 * @example
 * ```ts
 * // Valid absolute URLs (returns true)
 * isAbsoluteURL("https://example.com")                        // => true
 * isAbsoluteURL("http://example.com")                         // => true
 * isAbsoluteURL("ftp://example.com/a/b/c")                    // => true
 * isAbsoluteURL("http://host/%25")                            // => true
 * isAbsoluteURL("file://host/twoslashes?more//slashes")       // => true
 *
 * // Invalid absolute URLs (returns false)
 * isAbsoluteURL("example.com/abc/def")  // => false : missing protocol
 * isAbsoluteURL("abc")                  // => false : not a URL
 * ```
 */
export function isAbsoluteURL(s: string): boolean {
  try {
    new URL(s);
  } catch {
    return false;
  }
  return true;
}

/**
 * Converts a string segment into a URL-friendly slug format.
 * Handles spaces, special characters, and ampersands.
 *
 * @example
 * ```ts
 * slugify("note with spaces")       // => "note-with-spaces"
 * slugify("test & more")            // => "test-and-more"
 * slugify("what about 100%")        // => "what-about-100-percent"
 * slugify("test?query#anchor")      // => "testquery"
 * slugify("abc/def/ghi")            // => "abc/def/ghi"
 * slugify("abc/")                   // => "abc"
 * ```
 */
function slugify(s: string): string {
  // '&' used in title often means 'and', '%' used in title often means 'percent'
  return s
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/\?/g, "")
        .replace(/#/g, "")
    )
    .join("/")
    .replace(/\/$/, "");
}

/**
 * If `onlyStripPrefix` is not set to `true`, then this function strips the slash
 * at the beginning and the end of the input. Otherwise it only strips the
 * beginning slash.
 *
 * @example
 * ```ts
 * // Strip both leading and trailing slashes
 * stripSlashes("/abc/def/")    // => "abc/def"
 * stripSlashes("/abc/def")     // => "abc/def"
 * stripSlashes("abc/def/")     // => "abc/def"
 * stripSlashes("abc/def")      // => "abc/def"
 *
 * // Strip only leading slash
 * stripSlashes("/abc/def/", true)  // => "abc/def/"
 * stripSlashes("/abc/def", true)   // => "abc/def"
 * stripSlashes("abc/def/", true)   // => "abc/def/"
 * ```
 */
export function stripSlashes(s: string, onlyStripPrefix?: boolean): string {
  if (s.startsWith("/")) {
    s = s.substring(1);
  }
  if (!onlyStripPrefix && s.endsWith("/")) {
    s = s.slice(0, -1);
  }
  return s;
}

/**
 * When 'excludeExtension' is true, the file path will exclude the extensions.
 * This function excludes the markdown and HTML file extensions by default.
 *
 * @example
 * ```ts
 * // Markdown and HTML files - extensions stripped by default
 * slugifyFilePath("content/index.md")       // => "content/index"
 * slugifyFilePath("content/index.html")     // => "content/index"
 * slugifyFilePath("content/_index.md")      // => "content/index"
 * slugifyFilePath("/content/index.md")      // => "content/index"
 * slugifyFilePath("index.md")               // => "index"
 *
 * // Other file types - extensions preserved
 * slugifyFilePath("content/cool.png")       // => "content/cool.png"
 * slugifyFilePath("test.mp4")               // => "test.mp4"
 *
 * // Special characters handled
 * slugifyFilePath("note with spaces.md")       // => "note-with-spaces"
 * slugifyFilePath("notes.with.dots.md")        // => "notes.with.dots"
 * slugifyFilePath("test/special chars?.md")    // => "test/special-chars"
 * slugifyFilePath("test/special chars #3.md")  // => "test/special-chars-3"
 * slugifyFilePath("cool/what about r&d?.md")   // => "cool/what-about-r-and-d"
 * ```
 */
export function slugifyFilePath(fp: FilePath, excludeExtension?: boolean): FullSlug {
  // Actually I want to avoid this type casting but I didn't find the exact function
  // I want.
  fp = stripSlashes(fp) as FilePath;
  let extension = getFileExtension(fp);
  const withoutFileExtension = fp.replace(new RegExp(extension + "$"), "");

  if (excludeExtension || [".md", "html", undefined].includes(extension)) {
    extension = "";
    // When we need to exclude extensions or the file is HTML file or markdown
    // file, extensions will be excluded as empty.
  }
  let slug = slugify(withoutFileExtension);

  // Treat "_index" as "index". I guess the motivation may be:
  //   + Sorting behavior: in most file systems, files starting with "_" sort
  //     before alphanumeric files, making '_index.md' appear at the top of
  //     folder listings.
  if (endsWith(slug, "_index")) {
    slug = slug.replace(/_index$/, "index");
  }

  return (slug + extension) as FullSlug;
}

/**
 * Removes a suffix from a string if it ends with `/ + suffix`.
 *
 * @example
 * ```ts
 * // Basic usage
 * trimSuffix("abc/index", "index")     // => "abc/"
 * trimSuffix("abc/def", "index")       // => "abc/def"
 * trimSuffix("index", "index")         // => ""
 *
 * // With trailing slash
 * trimSuffix("abc/index/", "index")    // => "abc/"
 * ```
 */
export function trimSuffix(s: string, suffix: string): string {
  if (endsWith(s, suffix)) {
    s = s.slice(0, -suffix.length);
  }
  return s;
}

/**
 * Simplifies a full slug by removing 'index' suffix and leading/trailing slashes.
 * Returns "/" for empty or index-only slugs.
 *
 * @example
 * ```ts
 * // Index handling
 * simplifySlug("index")          // => "/"
 * simplifySlug("abc/index")      // => "abc/"
 *
 * // Regular slugs
 * simplifySlug("abc")            // => "abc"
 * simplifySlug("abc/def")        // => "abc/def"
 * ```
 */
export function simplifySlug(fp: FullSlug): SimpleSlug {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return (res.length === 0 ? "/" : res) as SimpleSlug;
}