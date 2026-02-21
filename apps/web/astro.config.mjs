import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";
import cloudflare from "@astrojs/cloudflare";
import dotenv from "dotenv";

// Load env vars from monorepo root
dotenv.config({ path: "../../.env" });

export default defineConfig({
  site: "https://futureofdev.com",
  integrations: [
    react(),
    sitemap(),
    sanity({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      useCdn: true,
    }),
  ],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    server: {
      allowedHosts: ["43f6-82-1-92-161.ngrok-free.app"],
    },
  },
});
