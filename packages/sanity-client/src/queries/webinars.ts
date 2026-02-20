import groq from "groq";

// Next upcoming webinar for insight CTAs
export const nextUpcomingWebinarQuery = groq`
  *[_type == "webinar" && defined(slug.current) && scheduledAt > now()] | order(scheduledAt asc)[0] {
    _id,
    title,
    slug,
    description,
    scheduledAt,
    duration,
    "speaker": speaker->{name, image},
    thumbnail,
    registrationUrl,
    isLive
  }
`;

// All upcoming webinars (not expired)
export const upcomingWebinarsQuery = groq`
  *[_type == "webinar" && defined(slug.current) && scheduledAt > now()] | order(scheduledAt asc) {
    _id,
    title,
    slug,
    description,
    scheduledAt,
    duration,
    timezone,
    "speaker": speaker->{name, image},
    thumbnail,
    category->{title, slug},
    registrationUrl,
    isLive
  }
`;

// Single webinar by slug (includes body for detail page)
export const webinarBySlugQuery = groq`
  *[_type == "webinar" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    body,
    scheduledAt,
    duration,
    timezone,
    "speaker": speaker->{name, bio, image},
    thumbnail,
    category->{title, slug},
    registrationUrl,
    registrationEnabled,
    isLive,
    recordingUrl
  }
`;
