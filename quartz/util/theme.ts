/**
 * controls the theming of the site.
 */
export interface ColorScheme {
  /** Light page background */
  light: string;
  /** Lightgray borders */
  lightgray: string;
  /** Gray elements */
  gray: string;
  /** Body text */
  darkgray: string;
  /** Header text and icons */
  dark: string;
  /** Link color, current 'graph' node */
  secondary: string;
  /** Hover states and visited 'graph' nodes */
  tertiary: string;
  /** Internal link background, highlighted text, highlighted lines of code */
  highlight: string;
  /** Markdown highlighted text background */
  textHighlight: string;
};

interface Colors {
  lightmode: ColorScheme;
  darkmode: ColorScheme;
}

export type FontSpecification =
  | string
  | {
      name: string;
      weights?: number[];
      includeItalic?: boolean;
    };

/**
 * Main theme configuration for the site.
 */
export interface Theme {
  /** Font specifications for different text elements */
  typography: {
    /** Font for the title of the site (optional, same as 'header' by default) */
    title?: FontSpecification;
    /** Font to use for headers */
    header: FontSpecification;
    /** Font for everything else */
    body: FontSpecification;
    /** Font for inline and block quotes */
    code: FontSpecification;
  };
  /** Use Google CDN to cache fonts (true = faster, false = self-contained) */
  cdnCaching: boolean;
  /** Color schemes for light and dark modes */
  colors: Colors;
  /** Source for fonts: "googlefonts" or "local" */
  fontOrigin: "googlefonts" | "local";
};

export type ThemeKey = keyof Colors;