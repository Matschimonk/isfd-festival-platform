# Italy Short Film Days Berlin 2027

A bilingual React, TypeScript and Vite festival homepage. Dates, film entries, venues and programme information are preview content. Artwork is generated for the mock festival. Ticket information is display-only.

## Setup

Use Node.js 20 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Select EN or IT in the header. Each collection scrolls horizontally by touch, trackpad or the arrow controls. Hover over a film or focus it with the keyboard for a synopsis. Click, tap or press Enter to open its full preview. Escape closes the preview.

```sh
npm run build
npm run preview
```

The build checks TypeScript and writes static assets to `dist/`. Preview serves that directory locally.

## WordPress integration

`src/content.ts` defines the `FestivalRepository` contract, the mock implementation and the locale model. Components consume normalised festival content without depending on WordPress response fields. To integrate later, implement `getFestival()` against a WordPress REST route and swap the repository export. Map film, collection and festival section records to the existing domain types. Keep film IDs stable across locales and use them to resolve collection membership. Support both English and Italian fields in the mapping, validate responses at the boundary, and map CMS media URLs to the film’s `stillUrl` field. Configure the API base per environment and keep any credentials server-side. Global interface translations live in `copy`. The language preference is stored in the browser.

## Deploy to Hostinger shared hosting

1. From the project root, run `npm ci` and `npm run build`. Vite builds for the root of the site, so the output is ready for `https://italyshortfilmdays2027.rawdrivers.org/`.
2. In Hostinger hPanel, open the File Manager for the festival subdomain and confirm its assigned document root. Use the subdomain’s own `public_html` if it has a separate hosting entry, or the exact folder hPanel assigns to the subdomain if it lives under the parent plan. If the folder also serves the existing Raw Drivers site, stop before uploading.
3. Back up any files already in the festival document root. Upload the **contents** of `dist/` directly to that root. Keep `index.html`, `assets/`, and `images/` at the same level. For an update, upload assets and images first, then replace `index.html`.
4. Open the festival URL over HTTPS and check the homepage, artwork, film previews, and language switch. If the certificate or hostname is unavailable, verify the existing configuration in hPanel before proceeding.

The build is static. Node.js is required on the build machine only. Navigation uses section anchors and needs no Apache rewrite rules. The upload requires no changes to DNS or to the parent site.
