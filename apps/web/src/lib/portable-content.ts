interface PortableSpan {
  _type?: string;
  text?: string;
  marks?: string[];
}

interface MarkDefinition {
  _key?: string;
  _type?: string;
  href?: string;
  slug?: string;
  docType?: string;
}

export interface PortableBlock {
  _type?: string;
  style?: string;
  listItem?: "bullet" | "number";
  children?: PortableSpan[];
  markDefs?: MarkDefinition[];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(definition: MarkDefinition): string | null {
  if (definition._type === "internalLink" && definition.slug) {
    return `/${definition.docType === "post" ? "insights/" : ""}${definition.slug}`;
  }
  if (!definition.href) return null;
  try {
    const url = new URL(definition.href, "https://futureofdev.com");
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return null;
    return definition.href;
  } catch {
    return null;
  }
}

function renderSpan(span: PortableSpan, definitions: MarkDefinition[]): string {
  let value = escapeHtml(span.text ?? "");
  for (const mark of span.marks ?? []) {
    if (mark === "strong") value = `<strong>${value}</strong>`;
    else if (mark === "em") value = `<em>${value}</em>`;
    else if (mark === "code") value = `<code>${value}</code>`;
    else {
      const definition = definitions.find((candidate) => candidate._key === mark);
      const href = definition ? safeHref(definition) : null;
      if (href) {
        const external = /^https?:/i.test(href);
        value = `<a href="${escapeHtml(href)}"${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>${value}</a>`;
      }
    }
  }
  return value;
}

function renderBlockText(block: PortableBlock): string {
  return (block.children ?? []).map((span) => renderSpan(span, block.markDefs ?? [])).join("");
}

export function portableBlocksToHtml(blocks: PortableBlock[] = []): string {
  const output: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = null;
  };

  for (const block of blocks) {
    if (block._type !== "block") continue;
    const text = renderBlockText(block);
    if (block.listItem) {
      const nextType = block.listItem === "number" ? "ol" : "ul";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        output.push(`<${listType}>`);
      }
      output.push(`<li>${text}</li>`);
      continue;
    }

    closeList();
    if (block.style === "h2") output.push(`<h2>${text}</h2>`);
    else if (block.style === "h3") output.push(`<h3>${text}</h3>`);
    else if (block.style === "blockquote") output.push(`<blockquote>${text}</blockquote>`);
    else output.push(`<p>${text}</p>`);
  }
  closeList();
  return output.join("\n");
}

export function portableText(blocks: PortableBlock[] = []): string {
  return blocks
    .filter((block) => block._type === "block")
    .map((block) => (block.children ?? []).map((child) => child.text ?? "").join(""))
    .join(" ");
}
