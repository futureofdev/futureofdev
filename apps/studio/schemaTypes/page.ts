import { defineType, defineField, defineArrayMember } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt Text" }),
          ],
        }),
        defineArrayMember({ type: "table" }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({
          name: "title",
          type: "string",
          title: "SEO Title",
          description: "Override the page title for search engines",
        }),
        defineField({
          name: "description",
          type: "text",
          title: "Meta Description",
          rows: 3,
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "image",
          type: "image",
          title: "Open Graph Image",
        }),
      ],
    }),
  ],
});
