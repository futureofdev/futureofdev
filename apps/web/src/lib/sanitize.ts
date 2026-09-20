import sanitizeHtmlLibrary from "sanitize-html";

const allowedTags = [
  "div", "p", "br", "h2", "h3", "h4", "h5", "strong", "b", "em", "i", "u", "s",
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
    exclusiveFilter: (frame) => {
      // `free_web_content` is a complete Beehiiv page render. Our page already
      // owns the title, dek and byline, so remove Beehiiv's duplicate header as
      // one subtree. All other layout divs lose their tag but keep their
      // authored content.
      if (frame.tag === "div") {
        return frame.attribs.id === "web-header" ? true : "excludeTag";
      }
      // Beehiiv's share links become empty after their SVGs are removed.
      if (frame.tag === "a" && !frame.text.trim() && frame.mediaChildren.length === 0) {
        return true;
      }
      return false;
    },
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
      h5: (_tagName, attributes) => ({
        tagName: "h2",
        attribs: { ...attributes, class: "article-section-title" },
      }),
    },
    allowedAttributes: {
      div: ["id"],
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      h2: ["class"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
    },
    allowedClasses: {
      h2: ["article-section-title"],
    },
    enforceHtmlBoundary: true,
  });
}
