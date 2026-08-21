import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env", quiet: true });

export default defineConfig({
  site: "https://futureofdev.com",
  // No route uses Astro sessions. The in-memory driver avoids requiring an
  // otherwise-unused Cloudflare KV binding while preserving adapter defaults.
  session: { driver: "memory" },
  adapter: cloudflare(),
  vite: {
    envDir: "../../",
    ...(process.env.NGROK_HOST
      ? { server: { allowedHosts: [process.env.NGROK_HOST] } }
      : {}),
  },
});
