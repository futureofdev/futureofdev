import sanitizeHtmlLibrary from "sanitize-html";

const allowedTags = [
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
  "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption", "pre",
  "code", "table", "thead", "tbody", "tr", "th", "td", "hr", "sup", "sub",
];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtmlLibrary(html, {
    allowedTags,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          ...(attributes.href?.startsWith("http")
            ? { rel: "noopener noreferrer", target: "_blank" }
            : {}),
        },
      }),
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: { ...attributes, loading: "lazy" },
      }),
    },
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
    },
    enforceHtmlBoundary: true,
  });
}
