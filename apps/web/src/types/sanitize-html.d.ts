declare module "sanitize-html" {
  interface FilterFrame {
    tag: string;
    attribs: Record<string, string>;
    text: string;
    mediaChildren: unknown[];
    tagPosition: number;
  }

  interface Options {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedClasses?: Record<string, string[] | false>;
    allowedSchemes?: string[];
    allowedSchemesByTag?: Record<string, string[]>;
    allowProtocolRelative?: boolean;
    disallowedTagsMode?: "discard" | "escape" | "recursiveEscape" | "completelyDiscard";
    enforceHtmlBoundary?: boolean;
    exclusiveFilter?: (frame: FilterFrame) => boolean | "excludeTag";
    transformTags?: Record<
      string,
      (tagName: string, attributes: Record<string, string>) => {
        tagName: string;
        attribs: Record<string, string>;
      }
    >;
  }
  export default function sanitizeHtml(html: string, options?: Options): string;
}
