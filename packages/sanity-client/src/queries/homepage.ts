import groq from "groq";

export const homepageQuery = groq`
  *[_type == "homepage"][0] {
    _id,
    title,
    tagline,
    featuredInsight {
      label,
      post-> {
        _id,
        title,
        slug
      }
    },
    featuredWebinar {
      label,
      ctaText,
      webinar-> {
        _id,
        title,
        slug,
        description,
        scheduledAt,
        duration,
        timezone,
        "speaker": speaker->{name, image},
        thumbnail,
        registrationUrl,
        isLive
      }
    },
    sections[] {
      _key,
      heading,
      paragraphs
    },
    seo {
      title,
      description
    }
  }
`;
