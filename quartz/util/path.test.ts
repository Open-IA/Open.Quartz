import test, { describe } from "node:test"
import * as path from "./path"
import assert from "node:assert"
import { FullSlug, TransformOptions, SimpleSlug } from "./path"

describe("typeguards", () => {
  test("isFullSlug", () => {
    assert(path.isFullSlug("index"))
    assert(path.isFullSlug("abc/def"))
    assert(path.isFullSlug("html.energy"))
    assert(path.isFullSlug("test.pdf"))

    assert(!path.isFullSlug("."))
    assert(!path.isFullSlug("./abc/def"))
    assert(!path.isFullSlug("../abc/def"))
    assert(!path.isFullSlug("abc/def#anchor"))
    assert(!path.isFullSlug("abc/def?query=1"))
    assert(!path.isFullSlug("note with spaces"))
  })

  test("isFilePath", () => {
    assert(path.isFilePath("content/index.md"))
    assert(path.isFilePath("content/test.png"))
    assert(!path.isFilePath("../test.pdf"))
    assert(!path.isFilePath("content/test"))
    assert(!path.isFilePath("./content/test"))
  })

  test("isSimpleSlug", () => {
    assert(path.isSimpleSlug(""))
    assert(path.isSimpleSlug("abc"))
    assert(path.isSimpleSlug("abc/"))
    assert(path.isSimpleSlug("notindex"))
    assert(path.isSimpleSlug("notindex/def"))

    assert(!path.isSimpleSlug("//"))
    assert(!path.isSimpleSlug("index"))
    assert(!path.isSimpleSlug("https://example.com"))
    assert(!path.isSimpleSlug("/abc"))
    assert(!path.isSimpleSlug("abc/index"))
    assert(!path.isSimpleSlug("abc#anchor"))
    assert(!path.isSimpleSlug("abc?query=1"))
    assert(!path.isSimpleSlug("index.md"))
    assert(!path.isSimpleSlug("index.html"))
  })

  test("isRelativeURL", () => {
    assert(path.isRelativeURL("."))
    assert(path.isRelativeURL(".."))
    assert(path.isRelativeURL("./abc/def"))
    assert(path.isRelativeURL("./abc/def#an-anchor"))
    assert(path.isRelativeURL("./abc/def?query=1#an-anchor"))
    assert(path.isRelativeURL("../abc/def"))
    assert(path.isRelativeURL("./abc/def.pdf"))

    assert(!path.isRelativeURL("abc"))
    assert(!path.isRelativeURL("/abc/def"))
    assert(!path.isRelativeURL(""))
    assert(!path.isRelativeURL("./abc/def.html"))
    assert(!path.isRelativeURL("./abc/def.md"))
  })

  test("isAbsoluteURL", () => {
    assert(path.isAbsoluteURL("https://example.com"))
    assert(path.isAbsoluteURL("http://example.com"))
    assert(path.isAbsoluteURL("ftp://example.com/a/b/c"))
    assert(path.isAbsoluteURL("http://host/%25"))
    assert(path.isAbsoluteURL("file://host/twoslashes?more//slashes"))

    assert(!path.isAbsoluteURL("example.com/abc/def"))
    assert(!path.isAbsoluteURL("abc"))
  })
})

describe("transforms", () => {
  function asserts<Inp, Out>(
    pairs: [string, string][],
    transform: (inp: Inp) => Out,
    checkPre: (x: any) => x is Inp,
    checkPost: (x: any) => x is Out,
  ) {
    for (const [inp, expected] of pairs) {
      assert(checkPre(inp), `${inp} wasn't the expected input type`)
      const actual = transform(inp)
      assert.strictEqual(
        actual,
        expected,
        `after transforming ${inp}, '${actual}' was not '${expected}'`,
      )
      assert(checkPost(actual), `${actual} wasn't the expected output type`)
    }
  }

  test("simplifySlug", () => {
    asserts(
      [
        ["index", "/"],
        ["abc", "abc"],
        ["abc/index", "abc/"],
        ["abc/def", "abc/def"],
      ],
      path.simplifySlug,
      path.isFullSlug,
      path.isSimpleSlug,
    )
  })

  test("slugifyFilePath", () => {
    asserts(
      [
        ["content/index.md", "content/index"],
        ["content/index.html", "content/index"],
        ["content/_index.md", "content/index"],
        ["/content/index.md", "content/index"],
        ["content/cool.png", "content/cool.png"],
        ["index.md", "index"],
        ["test.mp4", "test.mp4"],
        ["note with spaces.md", "note-with-spaces"],
        ["notes.with.dots.md", "notes.with.dots"],
        ["test/special chars?.md", "test/special-chars"],
        ["test/special chars #3.md", "test/special-chars-3"],
        ["cool/what about r&d?.md", "cool/what-about-r-and-d"],
      ],
      path.slugifyFilePath,
      path.isFilePath,
      path.isFullSlug,
    )
  })

  test("splitAnchor", () => {
    // Links without anchors
    assert.deepStrictEqual(path.splitAnchor("index"), ["index", ""])
    assert.deepStrictEqual(path.splitAnchor("abc/def"), ["abc/def", ""])
    assert.deepStrictEqual(path.splitAnchor("test.pdf"), ["test.pdf", ""])

    // Links with anchors (slugified for heading links using github-slugger)
    assert.deepStrictEqual(path.splitAnchor("index#intro"), ["index", "#intro"])
    assert.deepStrictEqual(path.splitAnchor("abc/def#section-1"), ["abc/def", "#section-1"])
    assert.deepStrictEqual(path.splitAnchor("abc/def#Hello World"), ["abc/def", "#hello-world"])
    // github-slugger doesn't replace underscores with hyphens
    assert.deepStrictEqual(path.splitAnchor("abc/def#test_anchor"), ["abc/def", "#test_anchor"])
    assert.deepStrictEqual(path.splitAnchor("abc/def#Test123"), ["abc/def", "#test123"])

    // PDF links preserve anchor as-is (for page numbers/named destinations)
    assert.deepStrictEqual(path.splitAnchor("document.pdf#page=5"), ["document.pdf", "#page=5"])
    assert.deepStrictEqual(path.splitAnchor("doc.pdf#section.2"), ["doc.pdf", "#section.2"])
    assert.deepStrictEqual(path.splitAnchor("report.pdf#chapter.1"), ["report.pdf", "#chapter.1"])

    // Multiple # characters - only splits on the first one
    assert.deepStrictEqual(path.splitAnchor("index#a#b"), ["index", "#a"])
    assert.deepStrictEqual(path.splitAnchor("test.md#foo#bar#baz"), ["test.md", "#foo"])

    // Edge cases
    assert.deepStrictEqual(path.splitAnchor("#anchor-only"), ["", "#anchor-only"])
    assert.deepStrictEqual(path.splitAnchor("file#"), ["file", "#"])
  })

  test("slugTag", () => {
    // Simple tags - note: slugify doesn't lowercase, spaces become hyphens
    assert.strictEqual(path.slugTag("javascript"), "javascript")
    assert.strictEqual(path.slugTag("Web Development"), "Web-Development")
    // & is replaced by -and-, but spaces are already replaced, so we get double hyphens
    assert.strictEqual(path.slugTag("test & more"), "test--and--more")
    assert.strictEqual(path.slugTag("what about 100%"), "what-about-100-percent")

    // Hierarchical tags (nested with slashes) - each segment slugified independently
    assert.strictEqual(path.slugTag("programming/languages/javascript/"), "programming/languages/javascript/")
    assert.strictEqual(path.slugTag("projects/active/website"), "projects/active/website")
    assert.strictEqual(path.slugTag("Web Dev/Frontend/React"), "Web-Dev/Frontend/React")

    // Tags with special characters - only ?, # get stripped; % becomes -percent
    // + is NOT handled, dots are preserved
    assert.strictEqual(path.slugTag("C++"), "C++")  // + is not handled by slugify
    assert.strictEqual(path.slugTag("C#"), "C")     // # gets stripped
    assert.strictEqual(path.slugTag("node.js"), "node.js")  // . is preserved
    assert.strictEqual(path.slugTag("foo?bar#baz"), "foobarbaz")  // ? and # stripped, content preserved

    // Trailing slashes - slugTag does NOT remove them (unlike slugify)
    assert.strictEqual(path.slugTag("programming/"), "programming/")
    assert.strictEqual(path.slugTag("programming/web/"), "programming/web/")

    // Mixed hierarchical with special chars
    assert.strictEqual(path.slugTag("Web Dev/Test & More/"), "Web-Dev/Test--and--More/")
    assert.strictEqual(path.slugTag("programming/C++/advanced"), "programming/C++/advanced")
  })

  test("transformInternalLink", () => {
    asserts(
      [
        ["", "."],
        [".", "."],
        ["./", "./"],
        ["./index", "./"],
        ["./index#abc", "./#abc"],
        ["./index.html", "./"],
        ["./index.md", "./"],
        ["./index.css", "./index.css"],
        ["content", "./content"],
        ["content/test.md", "./content/test"],
        ["content/test.pdf", "./content/test.pdf"],
        ["./content/test.md", "./content/test"],
        ["../content/test.md", "../content/test"],
        ["tags/", "./tags/"],
        ["/tags/", "./tags/"],
        ["content/with spaces", "./content/with-spaces"],
        ["content/with spaces/index", "./content/with-spaces/"],
        ["content/with spaces#and Anchor!", "./content/with-spaces#and-anchor"],
      ],
      path.transformInternalLink,
      (_x: string): _x is string => true,
      path.isRelativeURL,
    )
  })

  test("pathToRoot", () => {
    asserts(
      [
        ["index", "."],
        ["abc", "."],
        ["abc/def", ".."],
        ["abc/def/ghi", "../.."],
        ["abc/def/index", "../.."],
      ],
      path.pathToRoot,
      path.isFullSlug,
      path.isRelativeURL,
    )
  })

  test("joinSegments", () => {
    assert.strictEqual(path.joinSegments("a", "b"), "a/b")
    assert.strictEqual(path.joinSegments("a/", "b"), "a/b")
    assert.strictEqual(path.joinSegments("a", "b/"), "a/b/")
    assert.strictEqual(path.joinSegments("a/", "b/"), "a/b/")

    // preserve leading and trailing slashes
    assert.strictEqual(path.joinSegments("/a", "b"), "/a/b")
    assert.strictEqual(path.joinSegments("/a/", "b"), "/a/b")
    assert.strictEqual(path.joinSegments("/a", "b/"), "/a/b/")
    assert.strictEqual(path.joinSegments("/a/", "b/"), "/a/b/")

    // lone slash
    assert.strictEqual(path.joinSegments("/a/", "b", "/"), "/a/b/")
    assert.strictEqual(path.joinSegments("a/", "b" + "/"), "a/b/")

    // works with protocol specifiers
    assert.strictEqual(path.joinSegments("https://example.com", "a"), "https://example.com/a")
    assert.strictEqual(path.joinSegments("https://example.com/", "a"), "https://example.com/a")
    assert.strictEqual(path.joinSegments("https://example.com", "a/"), "https://example.com/a/")
    assert.strictEqual(path.joinSegments("https://example.com/", "a/"), "https://example.com/a/")
  })
})

describe("link strategies", () => {
  const allSlugs = [
    "a/b/c",
    "a/b/d",
    "a/b/index",
    "e/f",
    "e/g/h",
    "index",
    "a/test.png",
  ] as FullSlug[]

  describe("absolute", () => {
    const opts: TransformOptions = {
      strategy: "absolute",
      allSlugs,
    }

    test("from a/b/c", () => {
      const cur = "a/b/c" as FullSlug
      assert.strictEqual(path.transformLink(cur, "a/b/d", opts), "../../a/b/d")
      assert.strictEqual(path.transformLink(cur, "a/b/index", opts), "../../a/b/")
      assert.strictEqual(path.transformLink(cur, "e/f", opts), "../../e/f")
      assert.strictEqual(path.transformLink(cur, "e/g/h", opts), "../../e/g/h")
      assert.strictEqual(path.transformLink(cur, "index", opts), "../../")
      assert.strictEqual(path.transformLink(cur, "index.png", opts), "../../index.png")
      assert.strictEqual(path.transformLink(cur, "index#abc", opts), "../../#abc")
      assert.strictEqual(path.transformLink(cur, "tag/test", opts), "../../tag/test")
      assert.strictEqual(path.transformLink(cur, "a/b/c#test", opts), "../../a/b/c#test")
      assert.strictEqual(path.transformLink(cur, "a/test.png", opts), "../../a/test.png")
    })

    test("from a/b/index", () => {
      const cur = "a/b/index" as FullSlug
      assert.strictEqual(path.transformLink(cur, "a/b/d", opts), "../../a/b/d")
      assert.strictEqual(path.transformLink(cur, "a/b", opts), "../../a/b")
      assert.strictEqual(path.transformLink(cur, "index", opts), "../../")
    })

    test("from index", () => {
      const cur = "index" as FullSlug
      assert.strictEqual(path.transformLink(cur, "index", opts), "./")
      assert.strictEqual(path.transformLink(cur, "a/b/c", opts), "./a/b/c")
      assert.strictEqual(path.transformLink(cur, "a/b/index", opts), "./a/b/")
    })
  })

  describe("shortest", () => {
    const opts: TransformOptions = {
      strategy: "shortest",
      allSlugs,
    }

    test("from a/b/c", () => {
      const cur = "a/b/c" as FullSlug
      assert.strictEqual(path.transformLink(cur, "d", opts), "../../a/b/d")
      assert.strictEqual(path.transformLink(cur, "h", opts), "../../e/g/h")
      assert.strictEqual(path.transformLink(cur, "a/b/index", opts), "../../a/b/")
      assert.strictEqual(path.transformLink(cur, "a/b/index.png", opts), "../../a/b/index.png")
      assert.strictEqual(path.transformLink(cur, "a/b/index#abc", opts), "../../a/b/#abc")
      assert.strictEqual(path.transformLink(cur, "index", opts), "../../")
      assert.strictEqual(path.transformLink(cur, "index.png", opts), "../../index.png")
      assert.strictEqual(path.transformLink(cur, "test.png", opts), "../../a/test.png")
      assert.strictEqual(path.transformLink(cur, "index#abc", opts), "../../#abc")
    })

    test("from a/b/index", () => {
      const cur = "a/b/index" as FullSlug
      assert.strictEqual(path.transformLink(cur, "d", opts), "../../a/b/d")
      assert.strictEqual(path.transformLink(cur, "h", opts), "../../e/g/h")
      assert.strictEqual(path.transformLink(cur, "a/b/index", opts), "../../a/b/")
      assert.strictEqual(path.transformLink(cur, "index", opts), "../../")
    })

    test("from index", () => {
      const cur = "index" as FullSlug
      assert.strictEqual(path.transformLink(cur, "d", opts), "./a/b/d")
      assert.strictEqual(path.transformLink(cur, "h", opts), "./e/g/h")
      assert.strictEqual(path.transformLink(cur, "a/b/index", opts), "./a/b/")
      assert.strictEqual(path.transformLink(cur, "index", opts), "./")
    })
  })

  describe("relative", () => {
    const opts: TransformOptions = {
      strategy: "relative",
      allSlugs,
    }

    test("from a/b/c", () => {
      const cur = "a/b/c" as FullSlug
      assert.strictEqual(path.transformLink(cur, "d", opts), "./d")
      assert.strictEqual(path.transformLink(cur, "index", opts), "./")
      assert.strictEqual(path.transformLink(cur, "../../../index", opts), "../../../")
      assert.strictEqual(path.transformLink(cur, "../../../index.png", opts), "../../../index.png")
      assert.strictEqual(path.transformLink(cur, "../../../index#abc", opts), "../../../#abc")
      assert.strictEqual(path.transformLink(cur, "../../../", opts), "../../../")
      assert.strictEqual(
        path.transformLink(cur, "../../../a/test.png", opts),
        "../../../a/test.png",
      )
      assert.strictEqual(path.transformLink(cur, "../../../e/g/h", opts), "../../../e/g/h")
      assert.strictEqual(path.transformLink(cur, "../../../e/g/h", opts), "../../../e/g/h")
      assert.strictEqual(path.transformLink(cur, "../../../e/g/h#abc", opts), "../../../e/g/h#abc")
    })

    test("from a/b/index", () => {
      const cur = "a/b/index" as FullSlug
      assert.strictEqual(path.transformLink(cur, "../../index", opts), "../../")
      assert.strictEqual(path.transformLink(cur, "../../", opts), "../../")
      assert.strictEqual(path.transformLink(cur, "../../e/g/h", opts), "../../e/g/h")
      assert.strictEqual(path.transformLink(cur, "c", opts), "./c")
    })

    test("from index", () => {
      const cur = "index" as FullSlug
      assert.strictEqual(path.transformLink(cur, "e/g/h", opts), "./e/g/h")
      assert.strictEqual(path.transformLink(cur, "a/b/index", opts), "./a/b/")
    })
  })
})

describe("resolveRelative", () => {
  test("from index", () => {
    assert.strictEqual(path.resolveRelative("index" as FullSlug, "index" as FullSlug), "./")
    assert.strictEqual(path.resolveRelative("index" as FullSlug, "abc" as FullSlug), "./abc")
    assert.strictEqual(
      path.resolveRelative("index" as FullSlug, "abc/def" as FullSlug),
      "./abc/def",
    )
    assert.strictEqual(
      path.resolveRelative("index" as FullSlug, "abc/def/ghi" as FullSlug),
      "./abc/def/ghi",
    )
  })

  test("from nested page", () => {
    assert.strictEqual(path.resolveRelative("abc/def" as FullSlug, "index" as FullSlug), "../")
    assert.strictEqual(path.resolveRelative("abc/def" as FullSlug, "abc" as FullSlug), "../abc")
    assert.strictEqual(
      path.resolveRelative("abc/def" as FullSlug, "abc/def" as FullSlug),
      "../abc/def",
    )
    assert.strictEqual(
      path.resolveRelative("abc/def" as FullSlug, "ghi/jkl" as FullSlug),
      "../ghi/jkl",
    )
  })

  test("with index paths", () => {
    assert.strictEqual(path.resolveRelative("abc/index" as FullSlug, "index" as FullSlug), "../")
    assert.strictEqual(
      path.resolveRelative("abc/def/index" as FullSlug, "index" as FullSlug),
      "../../",
    )
    assert.strictEqual(path.resolveRelative("index" as FullSlug, "abc/index" as FullSlug), "./abc/")
    assert.strictEqual(
      path.resolveRelative("abc/def" as FullSlug, "abc/index" as FullSlug),
      "../abc/",
    )
  })

  test("with simple slugs", () => {
    assert.strictEqual(path.resolveRelative("abc/def" as FullSlug, "" as SimpleSlug), "../")
    assert.strictEqual(path.resolveRelative("abc/def" as FullSlug, "ghi" as SimpleSlug), "../ghi")
    assert.strictEqual(path.resolveRelative("abc/def" as FullSlug, "ghi/" as SimpleSlug), "../ghi/")
  })
})
