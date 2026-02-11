// The `Analytics` type defines a union of supported analytics providers and
// their required configuration fields, which flows through the build system to
// inject provider-specific tracking scripts via the `ComponentResources` emitter

import { ValidateDateType } from "./components/Date";
import { ValidLocale } from "./i18n";
import { Theme } from "./util/theme";

// `componentResources.ts`. It includes `null` to disable analytics entirely.
export type Analytics =
  | null
  | {
      provider: "plausible";
      host?: string;
      // plausible.io a Google Analytics alternative, the host field is your
      // self-hosted plausible instance. Make sure to use `https://` prefix
    }
  | {
      provider: "google";
      tagId: string;
      // use Google Analytics, tagId = <your-google-tag>
    }
  | {
      provider: "umami";
      websiteId: string;
      host?: string;
      // umami.is is an open source web analytics, open source url
      // https://github.com/umami-software/umami
    }
  | {
      provider: "goatcounter";
      websiteId: string;
      host?: string;
      scriptSrc?: string;
      // goatcounter is a lightweight open source web analytics, open source url
      // https://github.com/arp242/goatcounter
    }
  | {
      provider: "posthog";
      apiKey: string;
      host?: string;
      // posthog.com: https://github.com/PostHog/posthog
    }
  | {
      provider: "tinylytics";
      siteId: string;
      // tinylytics.app
    }
  | {
      provider: "cabin";
      host?: string;
      // withcabin.com
    }
  | {
      provider: "clarity";
      projectId?: string;
      // clarity.microsoft.com is an open source project of Microsoft
      // https://github.com/microsoft/clarity
    }
  | {
      provider: "matomo";
      siteId: string;
      host: string;
      // matomo: https://github.com/matomo-org/matomo
    }
  | {
      provider: "vercel";
    }
  | {
      provider: "rybbit";
      siteId: string;
      host?: string;
      // rybbit: https://github.com/rybbit-io/rybbit
    };

export interface GlobalConfiguration {
  // [+] This is also used when generating the RSS feed for your site
  pageTitle: string;
  // [+] A string added to the end of the page title. This only applies to the
  //    browser tab title, not the title shown at the top of the page.
  pageTitleSuffix?: string;
  // [+] Whether to enable single-page-app style rendering, this prevents flashes
  //   of unstyled content and improves smoothness of Quartz. Whether to enable
  //   SPA routing on your site
  enableSPA: boolean;
  // [+] Whether to display Wikipedia-style popovers when hovering over links
  enablePopovers: boolean;
  // [+] Analytics, what to use for analytics on your site
  analytics: Analytics;
  // [+] A list of glob patterns that Quartz should ignore and not search through
  //   when looking for files inside the `content` folder.
  ignorePatterns: string[];
  // [+] Whether to use created, modified or published as the default date to
  //   display on pages and page listings.
  defaultDateType: ValidateDateType;
  // [+] Base URL to use for CNAME files, sitemaps and RSS feeds that require
  //   an absolute URL. Quartz will avoid using this as much as possible and use
  //   relative URLs most of the time. Do not include the protocol 'https://',
  //   or any leading or trailing slashes.
  // 
  //   + This should also include the subpath if you are hosting on Github pages
  //     without a custom domain. For example: open-ia.github.io/Open.Quartz
  //   + Note that Quartz4 will avoid using this as much as possible and use
  //     relative URLs whenever it can to make sure your site works no matter
  //     where you end up actually deploying it.
  baseUrl?: string;
  // [+] Config how the size looks.
  //   + cdnCaching: if 'true' (default), use Google CDN to cache fonts. This
  //     will generally be faster. Disable ('false') this if you want Quartz to
  //     download the fonts to be self-contained.
  //   + typography: what fonts to use. Any font available on Google Fonts works
  //     here:
  //     + title: font for the title of the site (optional, same as 'header' as
  //       default)
  //     + header: font to use for headers
  //     + code: font for inline and block quotes
  //     + body: font for everything
  //   + colors: controls the theming of the site.
  //     + light: page background
  //     + lightgray: borders
  //     + gray: graph links, heavier borders
  //     + darkgray: body text
  //     + dark: header text and icons
  //     + secondary: link color, current 'graph' node
  //     + tertiary: hover states and visited 'graph' nodes
  //     + highlight: internal link background, highlighted text, "highlighted
  //       lines of code"
  //     + textHighlight: markdown highlighted text background
  theme: Theme;
  // [+] Use for i18n and date formatting
  locale: ValidLocale;
}