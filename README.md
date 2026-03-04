# PrintForge (Landing + App Shell)

This repo contains:
- **Landing (SEO-first)**: `/`, `/tr/`, `/en/`
- **App shell (builder placeholder for now)**: `/app/`

## Local dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages (Project Pages) — zero manual config
The workflow auto-sets:
- `BASE_PATH` to `/<repo>/`
- `SITE_URL` to `https://<owner>.github.io/<repo>`

So canonical URLs, OG images, hreflang, robots.txt and sitemap.xml are correct by default.

### Custom domain?
If you later use a custom domain, just edit the workflow env:
- `BASE_PATH: "/"` (usually)
- `SITE_URL: "https://yourdomain.com"`

## Notes
- `/app` is `noindex` for now. SEO is driven by `/tr` and `/en`.
