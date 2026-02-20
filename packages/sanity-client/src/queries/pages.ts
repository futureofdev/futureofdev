import groq from "groq";

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    seo {
      title,
      description,
      image
    }
  }
`;

export const allPagesQuery = groq`
  *[_type == "page" && defined(slug.current)] {
    _id,
    title,
    slug
  }
`;
