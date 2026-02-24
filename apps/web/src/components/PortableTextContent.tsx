import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// We'll create the client inline to avoid import issues
const projectId = import.meta.env.SANITY_PROJECT_ID || import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || import.meta.env.PUBLIC_SANITY_DATASET || "production";

const builder = imageUrlBuilder({ projectId, dataset });

function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

const components = {
  block: {
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl md:text-2xl font-semibold mt-14 mb-6 tracking-tight text-foreground border-b border-border/50 pb-3">
        {children}
      </h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-lg md:text-xl font-semibold mt-10 mb-4 tracking-tight text-foreground">
        {children}
      </h3>
    ),
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-7 leading-[1.8] text-foreground/85">{children}</p>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="relative my-10 rounded-r-lg border-l-[3px] border-primary/40 bg-primary/[0.04] px-5 py-4 text-foreground/75 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({
      value,
      children,
    }: {
      value?: { href?: string };
      children: React.ReactNode;
    }) => (
      <a
        href={value?.href}
        className="underline underline-offset-4 decoration-foreground/25 hover:decoration-foreground/60 transition-all duration-200"
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    internalLink: ({
      value,
      children,
    }: {
      value?: { slug?: string; docType?: string };
      children: React.ReactNode;
    }) => {
      const slug = value?.slug;
      const docType = value?.docType;
      if (!slug) return <>{children}</>;
      const href = docType === "course" ? `/claude-academy/${slug}` : `/insights/${slug}`;
      return (
        <a href={href} className="underline underline-offset-4 decoration-foreground/25 hover:decoration-foreground/60 transition-all duration-200">
          {children}
        </a>
      );
    },
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: { children: React.ReactNode }) => (
      <code className="bg-foreground/[0.06] dark:bg-foreground/[0.12] px-1.5 py-0.5 rounded-sm font-mono text-[0.875em] text-foreground/95 border border-border/30">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }: { value: { alt?: string; caption?: string } & SanityImageSource }) => (
      <figure className="my-10 -mx-4 md:mx-0">
        <img
          src={urlFor(value).width(800).auto("format").url()}
          alt={value.alt || ""}
          className="w-full md:rounded-md"
          loading="lazy"
        />
        {value.caption && (
          <figcaption className="text-sm text-muted-foreground mt-3 px-4 md:px-0 font-mono">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    code: ({ value }: { value: { code: string; language?: string; filename?: string } }) => (
      <div className="my-8 -mx-4 md:mx-0">
        {value.filename && (
          <div className="bg-foreground/[0.04] dark:bg-foreground/[0.08] px-4 py-2 font-mono text-xs text-muted-foreground border-b border-border/30 md:rounded-t-md">
            {value.filename}
          </div>
        )}
        <pre className={`bg-foreground/[0.03] dark:bg-foreground/[0.06] p-4 md:p-5 overflow-x-auto font-mono text-sm leading-relaxed border border-border/30 ${value.filename ? 'md:rounded-b-md' : 'md:rounded-md'}`}>
          <code className="text-foreground/90">{value.code}</code>
        </pre>
      </div>
    ),
    table: ({ value }: { value: { rows?: Array<{ _key: string; cells?: string[] }>; hasHeaderRow?: boolean; caption?: string } }) => {
      const rows = value.rows ?? [];
      const hasHeaderRow = value.hasHeaderRow ?? true;
      const [headerRow, ...bodyRows] = hasHeaderRow ? rows : [null, ...rows];
      const dataRows = hasHeaderRow ? bodyRows : rows;

      return (
        <figure className="my-8 -mx-4 md:mx-0 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {hasHeaderRow && headerRow && (
              <thead>
                <tr className="border-b border-border">
                  {(headerRow.cells ?? []).map((cell, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left font-semibold text-foreground bg-foreground/[0.03] dark:bg-foreground/[0.06]"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {dataRows.map((row) => (
                <tr key={row._key} className="border-b border-border/50 last:border-0 hover:bg-foreground/[0.02] transition-colors">
                  {(row.cells ?? []).map((cell, i) => (
                    <td key={i} className="px-4 py-2.5 text-foreground/85">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {value.caption && (
            <figcaption className="text-sm text-muted-foreground mt-3 px-4 md:px-0 font-mono">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  list: {
    bullet: ({ children, value }: { children: React.ReactNode; value: { level?: number } }) => (
      <ul className={`list-disc mb-6 space-y-2 ${value?.level && value.level > 1 ? 'ml-6 mt-2 mb-2' : 'ml-5'}`}>
        {children}
      </ul>
    ),
    number: ({ children, value }: { children: React.ReactNode; value: { level?: number } }) => (
      <ol className={`list-decimal mb-6 space-y-2 ${value?.level && value.level > 1 ? 'ml-6 mt-2 mb-2' : 'ml-5'}`}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li className="leading-[1.75] text-foreground/85 pl-1">
        {children}
      </li>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <li className="leading-[1.75] text-foreground/85 pl-1">
        {children}
      </li>
    ),
  },
};

interface Props {
  value: unknown;
}

export function PortableTextContent({ value }: Props) {
  if (!value) return null;
  return <PortableText value={value as any} components={components} />;
}
