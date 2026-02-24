import { createSanityClient } from "@futureofdev/sanity-client";

export const sanityClient = createSanityClient({
  preview: process.env.SANITY_PREVIEW === "true",
});
