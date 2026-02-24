import { defineType, defineField, defineArrayMember } from "sanity";
import { InsertAboveIcon } from "@sanity/icons";

export const tableRow = defineType({
  name: "tableRow",
  title: "Table Row",
  type: "object",
  fields: [
    defineField({
      name: "cells",
      title: "Cells",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: {
    select: { cells: "cells" },
    prepare({ cells }) {
      const preview = Array.isArray(cells) ? cells.filter(Boolean).join(" | ") : "";
      return { title: preview || "Empty row" };
    },
  },
});

export const table = defineType({
  name: "table",
  title: "Table",
  type: "object",
  icon: InsertAboveIcon,
  fields: [
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional caption displayed below the table",
    }),
    defineField({
      name: "hasHeaderRow",
      title: "First row is a header",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [defineArrayMember({ type: "tableRow" })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { rows: "rows", caption: "caption" },
    prepare({ rows, caption }) {
      const rowCount = Array.isArray(rows) ? rows.length : 0;
      const colCount = Array.isArray(rows) && rows[0]?.cells ? rows[0].cells.length : 0;
      return {
        title: caption || "Table",
        subtitle: `${rowCount} row${rowCount !== 1 ? "s" : ""} × ${colCount} col${colCount !== 1 ? "s" : ""}`,
      };
    },
  },
});
