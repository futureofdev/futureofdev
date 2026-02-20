import groq from "groq";

export const allCoursesQuery = groq`
  *[_type == "course"] | order(_createdAt asc) {
    _id,
    title,
    slug,
    tagline,
    description,
    level,
    tags,
    comingSoon,
    thumbnail
  }
`;

export const courseBySlugQuery = groq`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    tagline,
    description,
    level,
    tags,
    comingSoon,
    thumbnail,
    body,
    attachments[] {
      _key,
      label,
      file {
        asset-> {
          url,
          originalFilename,
          size,
          mimeType
        }
      }
    }
  }
`;
