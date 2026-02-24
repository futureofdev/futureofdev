import { defineType, defineField, defineArrayMember } from "sanity";
import { BookIcon } from "@sanity/icons";

export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  icon: BookIcon,
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
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short hook displayed on course cards",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Summary shown on the course listing",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "Beginner" },
          { title: "Intermediate", value: "Intermediate" },
          { title: "Advanced", value: "Advanced" },
          { title: "All levels", value: "All levels" },
        ],
        layout: "radio",
      },
      initialValue: "Beginner",
    }),
    defineField({
      name: "comingSoon",
      title: "Coming Soon",
      type: "boolean",
      description: "Show a 'Coming Soon' badge and subscription form instead of course content",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt Text" }),
      ],
    }),
    defineField({
      name: "attachments",
      title: "Attachments",
      description: "Files learners can download — shown at the top of the course page",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "attachment",
          title: "Attachment",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "file",
              title: "File",
              type: "file",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label" },
          },
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      description: "Full course overview — about the course, who it's for, what's covered, etc.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (rule) =>
                      rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
                  }),
                ],
              },
            ],
          },
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt Text" }),
            defineField({ name: "caption", type: "string", title: "Caption" }),
          ],
        }),
        defineArrayMember({ type: "table" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "tagline",
      media: "thumbnail",
    },
  },
});
