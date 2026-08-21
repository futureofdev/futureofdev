declare module "sanitize-html" {
  interface Options {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    allowedSchemesByTag?: Record<string, string[]>;
    allowProtocolRelative?: boolean;
    disallowedTagsMode?: "discard" | "escape" | "recursiveEscape" | "completelyDiscard";
    enforceHtmlBoundary?: boolean;
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
