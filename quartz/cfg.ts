// The `Analytics` type defines a union of supported analytics providers and
// their required configuration fields, which flows through the build system to
// inject provider-specific tracking scripts via the `ComponentResources` emitter

import { ValidateDateType } from "./components/Date";

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
  defaultDateType: ValidateDateType;
}