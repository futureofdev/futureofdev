import { defineType, defineField, defineArrayMember } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const webinar = defineType({
  name: "webinar",
  title: "Webinar",
  type: "document",
  icon: CalendarIcon,
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
      name: "scheduledAt",
      title: "Scheduled Date & Time",
      type: "datetime",
      description: "When the webinar will take place",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration (minutes)",
      type: "number",
      description: "Expected duration in minutes",
      initialValue: 60,
      validation: (rule) => rule.required().min(15).max(480),
    }),
    defineField({
      name: "timezone",
      title: "Timezone",
      type: "string",
      description: "Display timezone for the webinar",
      initialValue: "America/New_York",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      description: "Brief description for listings and CTAs",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "body",
      title: "Full Description / Agenda",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
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
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  }),
                ],
              },
            ],
          },
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
          ],
        }),
      ],
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "speaker",
      title: "Speaker",
      type: "reference",
      to: [{ type: "author" }],
      description: "The webinar host/speaker",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
      description: "External registration link (Phase 2: will link to app registration)",
    }),
    defineField({
      name: "registrationEnabled",
      title: "Enable App Registration",
      type: "boolean",
      description: "Phase 2: Enable in-app registration",
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: "isLive",
      title: "Currently Live",
      type: "boolean",
      description: "Mark as live when the webinar is happening",
      initialValue: false,
    }),
    defineField({
      name: "recordingUrl",
      title: "Recording URL",
      type: "url",
      description: "Link to webinar recording after it ends",
    }),
  ],
  preview: {
    select: {
      title: "title",
      speaker: "speaker.name",
      scheduledAt: "scheduledAt",
      media: "thumbnail",
    },
    prepare({ title, speaker, scheduledAt, media }) {
      const date = scheduledAt
        ? new Date(scheduledAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "No date";
      return {
        title,
        subtitle: `${speaker ? `with ${speaker}` : ""} - ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Scheduled Date, Newest",
      name: "scheduledAtDesc",
      by: [{ field: "scheduledAt", direction: "desc" }],
    },
    {
      title: "Scheduled Date, Oldest",
      name: "scheduledAtAsc",
      by: [{ field: "scheduledAt", direction: "asc" }],
    },
  ],
});
