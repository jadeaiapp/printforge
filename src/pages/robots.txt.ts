export const prerender = true;
import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const site = (import.meta.env.SITE ?? "https://example.com").replace(/\/$/, "");
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");
  const sitemap = `${site}${base}sitemap.xml`;

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`,
    ""
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
