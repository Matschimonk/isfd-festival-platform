# Festival media intake

Send source files and releases through the festival’s private intake channel. Keep signed releases, personal contact details, editing masters, and credentials out of Git. The content editor needs an internal permission reference and a public provenance URL for each published asset.

## Submit the files and metadata

| Required asset | What to supply |
| --- | --- |
| 2026 photos and galleries | Original files, shoot date and location, photographer, copyright holder, permission to publish and crop, and the people or screenings shown. Include material for behind-the-scenes and award chapters. |
| Posters and stills | The exact film title and existing film ID, approved artwork, crop restrictions and credit line. |
| Excerpts, interviews and aftermovie | An approved MP4 or WebM URL, thumbnail, filmmaker and rights holder, any music and participant clearances, and WebVTT captions. Identifying a clip as silent requires editorial confirmation. |
| Portraits and guests | Approved portrait, full credit and existing guest ID. Actor, actress and director award profiles use `award-actor`, `award-actress` and `award-director`. |
| Podcasts and workshop recordings | Approved audio/video URL, participant and event references where known, title, summary, and a transcript for audio. Video follows the caption rule above. |
| Every item | Italian, German and English title and description. Describe the content of an image in all three locales for its alt text. Supply the rights owner, credit, edition and public source. |

## Edit and preview

1. Copy a record from the [templates](media-intake-template.json) into `content/media.json`. Template names and URLs are placeholders. Choose a unique slug, use the existing IDs in `src/archive.ts` / `src/content.ts`, and set `status: "draft"` and `rights: "pending"` while it is under review.
2. For a local image, place a WebP derivative in `content/media-files/` and use `local:filename.webp` in the manifest. Keep this directory out of `public/`. The pipeline emits content-hashed WebPs from published, rights-approved records only. For responsive display, provide the real pixel dimensions, optionally add differently sized versions with the same crop and aspect ratio, and provide a small thumbnail where useful. Keep translations and credit lines in the manifest.
3. Use direct HTTPS media URLs for externally hosted assets. Supported external images are WebP, AVIF, JPEG and PNG. Video uses MP4 or WebM, audio MP3, M4A or Ogg, and caption files WebVTT. Use a public media host that allows anonymous cross-origin playback and caption requests. Test the actual media, captions and range requests in a browser. Builds validate URL and format syntax offline. They check the existence, non-symlink path and WebP signature of local files.
4. Choose `role` to place a poster, still, preview, portrait, interview, podcast or workshop asset. Use `archive` to assign any eligible 2026 asset to an archive chapter. The `archive` role requires a chapter. Relationship lists support films, guests, events and venues. Related films get direct gallery links, and a linked programme event can show the same recording on its detail page.
5. After clearance, set `rights: "approved"` and supply an opaque `permissionRef`, such as an internal record number. Set `status: "published"` only after editorial review. The app receives neither draft records nor internal permission references. A published record without approved rights blocks the build.
6. Run `npm run media:validate`, `npm run media:test` and `npm run build`. Start or restart `npm run dev` after editing the manifest. Check all three languages, credits and alt text, keyboard access, video captions and mobile layout before submitting a content PR.

## Architecture and current archive

The manifest is the editorial source of truth. Vite validates it against the festival catalog, emits vetted derivatives, and supplies the same public-only records to the React client and prerenderer. Existing film titles, durations, credits, genres and routes remain in the festival catalog. Approved media appears in the existing cards, film and event details, profiles, podcast and interview features, and grouped archive chapters. The archive keeps its existing awards and press links.

The current manifest is empty because this task received no cleared archival or production assets. The live design has verified text, programme and award material plus the media-availability state. Local fixtures demonstrate image enlargement and media placement without representing a historical event.

A visual CMS is a separate evaluation. Criteria include role-based approvals, tri-language editing, rights auditability, and an export compatible with this manifest.

## Review evidence

- [Archive desktop, English](review/media-v1/archive-desktop.webp) and [archive mobile, German](review/media-v1/archive-mobile.webp). Both show the current publishable archive with media availability expanded.
- Clean install, media validation, test suite and production build passed. All 231 canonical and alternate URLs matched prerendered HTML. IT, DE and EN passed desktop, tablet and mobile navigation checks.
- A separate temporary local build covered responsive images, fullscreen open/close and focus return, keyboard Escape, deferred previews, caption tracks, transcripts, film links and the no-JavaScript image fallback. The local development server served vetted renditions and denied direct requests for the raw manifest and draft files. The fixture files and internal rights reference did not enter the candidate.
