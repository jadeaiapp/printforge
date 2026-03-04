import { defineConfig } from "astro/config";

const BASE_PATH = process.env.BASE_PATH ?? "/";
const SITE_URL = process.env.SITE_URL ?? "https://example.com";

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: "static",
});
