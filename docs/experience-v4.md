# Experience V4

## Local review

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4284 --strictPort
```

Open `http://127.0.0.1:4284/en/films/#film-discovery` for the film rail, `/en/journal/` for the journal and `/en/programme/` for the timetable. Replace `en` with `it` or `de` to review the other languages. The header switches languages without losing the current film or story. The loopback server is for a local rehearsal. The [private preview guide](presentation-preview.md) covers a separately approved remote address.

## What changed

- `FilmDiscovery` adds a curated rail of ten verified 2026 films to Discover and Films. Scroll horizontally with touch, a trackpad or Shift + wheel. Drag with a mouse or use the visible arrow buttons. With the rail focused, use Left/Right, Home or End. Film titles always link to the existing detail pages. The full archive still lists all 30 films. Where a sourced award is linked to a title, the hover and focus reveal includes the award.
- `EditorialJournal` adds a featured story, three selected stories, and filters for Interviews, Festival Stories, Behind the Screen and Perspectives. An article can display a byline, publication date, cleared hero, editorial pull quote, related film or event, and previous/next links. The installed stories are labelled demos. Their bylines and preview dates describe this editorial sample. They link to existing coverage and archival records and contain no invented interviews or quotes attributed to people.
- `EditorialPicture` reads localized alt text, intrinsic dimensions and optional width variants from the existing image model. Film posters, journal photography and external trailer links require approved records. The featured demo and article headers use responsive variants of the existing preview artwork. The film rail and secondary journal cards use original typographic and geometric treatments until authentic imagery is cleared.
- The header has a direct Programme link and a secondary Journal link. The seven-day timetable, filters, My Festival, Day/Night themes, 2026 archive, Partners, ticket demo and newsletter remain available at their existing URLs.

## New routes and search metadata

For each of `it`, `de` and `en`, `/journal/` lists the editorial collection. The article slugs are `after-the-lights`, `before-the-first-question`, `what-the-cut-leaves-out` and `short-is-a-form`. Each page has static HTML, a localized title, description and language alternates. Demo article pages have `noindex,follow` and are omitted from the sitemap. The default build contains **255 canonical pages plus the root homepage** and **243 sitemap URLs**. The collection landing is indexable. Final editorial records can be indexed and emit `Article` structured data once reviewed and marked ready.

The production publishing scripts were left intact. A future approved release needs to review the static allowlist for the journal paths and image variants.

## Editorial and permissions checklist

- [ ] Supply the approved 2026 festival photographs, official posters, award photographs and verified film stills. Record the rights holder, photographer or designer, written permission for site use, allowed crops, and any required credit placement.
- [ ] For each image, supply the original file, a focal point if cropping matters, and meaningful Italian, German and English alt text. Add dimensions and responsive widths to the `EditorialImage`. Approve it only after rights and attribution have been recorded.
- [ ] Supply confirmed article copy, approved byline, publication date and translations or review sign-off for each category. Include source links, related film and event IDs, and permission for any interview excerpts, translations, or quotations. Replace demo stories with reviewed records in `src/journal-content.ts`.
- [ ] For trailers, supply the exact authorized HTTPS URL and credit per film. Record approval before adding `Film.approvedTrailer`. Confirm that the external host may show the clip in each intended territory. The rail opens approved trailer links on a click and renders no player.
- [ ] Confirm permission for the TaxiDrivers character reference and the ISFD trophy likeness before commissioning animation assets.

## Future Golden Cameraman animation

Use an approved reference of the TaxiDrivers camera-headed figure and the official trophy design. Storyboard three beats: the figure in silhouette, its camera geometry folding into the trophy form, and the gold trophy holding against the festival key visual. Keep ISFD’s title and programme CTA readable throughout. Review the transformation with the brand and rights owners before choosing a lightweight implementation. Use a short, silent, one-time motion treatment, a static final frame when reduced motion is requested, and ensure the poster and navigation render before any animation loads. Use the static frame on devices where motion would impair performance. This prototype retains the existing hero motion.

## Screenshots

| Scenario | Desktop | Mobile |
| --- | --- | --- |
| Film discovery | [Desktop film rail](review/experience-v4/films-desktop.webp) | [Mobile film rail](review/experience-v4/films-mobile.webp) |
| Journal landing | [Desktop journal](review/experience-v4/journal-desktop.webp) | [Mobile journal](review/experience-v4/journal-mobile.webp) |
| Article | [Desktop article](review/experience-v4/article-desktop.webp) | [Mobile article](review/experience-v4/article-mobile.webp) |

## Verification

- A clean `npm ci` and `npm run build` succeeded. Local HTTP checks traversed all 255 canonical pages, validated the 243 sitemap URLs and checked the 12 demo articles in all three languages. The checks included reciprocal hreflang, canonicals, social titles and descriptions, structured data and internal links.
- Chromium checks covered mouse drag, horizontal and Shift-wheel input, native touch swipe and snap, arrow controls, keyboard focus, reduced motion, category filters, article navigation, language switching and static HTML with JavaScript disabled. An isolated rights test exposed an approved responsive poster and trailer and hid pending, legacy and unsafe media. No external trailer was requested by the rail.
- Across 20 automated V4 accessibility scans, axe reported no WCAG 2/2.1 A or AA violations. The existing timetable and privacy demo suite passed a further 32 scans. The checks also verified My Festival persistence, the 30-film archive, and that the ticket and newsletter demos made no live transactions or submissions.
