export const prerender = true;
import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const site = (import.meta.env.SITE ?? "https://example.com").replace(/\/$/, "");
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");

  // SEO-first pages only (exclude /app which is noindex)
  const paths = ["", "tr/", "en/"];

  const urls = paths.map((p) => {
    const loc = `${site}${base}${p}`;
    return `<url><loc>${loc}</loc></url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
