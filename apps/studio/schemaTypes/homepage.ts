import { defineType, defineField, defineArrayMember } from "sanity";
import { HomeIcon } from "@sanity/icons";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      description: "The main title displayed in the hero section",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "The subtitle displayed below the title",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuredInsight",
      title: "Featured Insight",
      type: "object",
      description: "The insight shown in the eyebrow above the title",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          initialValue: "Insight",
        }),
        defineField({
          name: "post",
          title: "Post",
          type: "reference",
          to: [{ type: "post" }],
        }),
      ],
    }),
    defineField({
      name: "featuredWebinar",
      title: "Featured Webinar",
      type: "object",
      description: "The webinar shown as primary CTA in the hero section",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          initialValue: "Upcoming Webinar",
        }),
        defineField({
          name: "webinar",
          title: "Webinar",
          type: "reference",
          to: [{ type: "webinar" }],
        }),
        defineField({
          name: "ctaText",
          title: "CTA Button Text",
          type: "string",
          initialValue: "Register Now",
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      description: "Add, remove, and reorder content sections",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          title: "Section",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 2 })],
              description: "Each item appears as a separate paragraph",
            }),
          ],
          preview: {
            select: { title: "heading", paragraphs: "paragraphs" },
            prepare({ title, paragraphs }) {
              return {
                title: title || "Untitled Section",
                subtitle: paragraphs?.[0]?.slice(0, 50) + "..." || "",
              };
            },
          },
        }),
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
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage",
        subtitle: "Site homepage content",
      };
    },
  },
});
