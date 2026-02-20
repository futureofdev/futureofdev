import { createClient, type ClientConfig } from "@sanity/client";

const config: ClientConfig = {
  projectId:
    import.meta.env?.SANITY_PROJECT_ID ??
    import.meta.env?.PUBLIC_SANITY_PROJECT_ID ??
    process.env.SANITY_PROJECT_ID ??
    "",
  dataset:
    import.meta.env?.SANITY_DATASET ??
    import.meta.env?.PUBLIC_SANITY_DATASET ??
    process.env.SANITY_DATASET ??
    "production",
  apiVersion: "2024-01-01",
  useCdn: true,
};

export function createSanityClient(options?: { preview?: boolean }) {
  return createClient({
    ...config,
    useCdn: !options?.preview,
    perspective: options?.preview ? "previewDrafts" : "published",
    token: options?.preview ? process.env.SANITY_API_TOKEN : undefined,
  });
}

export const sanityClient = createSanityClient();
