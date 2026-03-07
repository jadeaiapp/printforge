# PrintForge (Landing TR/EN + App Shell)

This repo contains:
- **SEO-first landing pages**: `/`, `/tr/`, `/en/`
- **App shell (builder placeholder for now)**: `/app/` (noindex)

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

## GitHub Pages
This project is configured for GitHub **Project Pages**:
`https://<owner>.github.io/<repo>/`

The GitHub Actions workflow automatically sets:
- `BASE_PATH` to `/<repo>/`
- `SITE_URL` to `https://<owner>.github.io/<repo>`

So canonical URLs, OG images, hreflang, robots.txt and sitemap.xml are correct by default.

### Prefer `npm ci`?
If you want reproducible CI builds, run `npm install` once locally and commit `package-lock.json`, then change the workflow step from `npm install` to `npm ci`.
