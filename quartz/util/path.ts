import { slug as slugAnchor } from "github-slugger";
import type { Element as HastElement } from "hast";
import { clone } from "./clone";

// This file must be isomorphic (between node and browser) so it can't use node
// libraries like 'path'

export function getFileExtension(s: string): string | undefined {
  return s.match(/\.[A-Za-z0-9]+$/)?.[0];
}

function _hasFileExtension(s: string): boolean {
  return getFileExtension(s) !== undefined;
}

/**
 * This function will be only used in type guard function `isFullSlug` and
 * `isSimpleSlug`. These forbidden characters are used in URL parameters.
 */
function containsForbiddenCharacters(s: string): boolean {
  return s.includes(" ") || s.includes("#") || s.includes("?") || s.includes("&");
}

/**
 * Notice this function is not same to `String.prototype.endsWith`. It checks
 * whether the path ends with `/ + suffix`.
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
 */
export function isRelativeURL(s: string): s is RelativeURL {
  const validateStart = /^\.{1,2}/.test(s);
  const validateEnding = !endsWith(s, "index");
  return validateStart && validateEnding && ![".md", ".html"].includes(getFileExtension(s) ?? "");
}

/**
 * `isAbsoluteURL` uses `URL` constructor function to check an URL is absolute.
 */
export function isAbsoluteURL(s: string): boolean {
  try {
    new URL(s);
  } catch {
    return false;
  }
  return true;
}

function sluggify(s: string): string {
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