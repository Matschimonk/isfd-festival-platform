# Festival Experience V2 review

This branch starts at Experience V1 commit `2248775`. The design uses the existing festival artwork, expressive typesetting, a sticky ticket link and a chapter-style navigation. All editorial artwork made for this update is composed of abstract shapes and type.

## Before and after

The English pages were captured from local production builds at the same desktop and mobile sizes with reduced motion enabled. Film cards and archival graphics are visible in the desktop section captures.

| View | Experience V1 | Experience V2 |
| --- | --- | --- |
| Desktop homepage | [Before](review/experience-v2/v1-desktop-home.webp) | [After](review/experience-v2/v2-desktop-home.webp) |
| Mobile homepage | [Before](review/experience-v2/v1-mobile-home.webp) | [After](review/experience-v2/v2-mobile-home.webp) |
| Film discovery | [Before](review/experience-v2/v1-desktop-films.webp) | [After](review/experience-v2/v2-desktop-films.webp) |
| 2026 retrospective | [Before](review/experience-v2/v1-desktop-archive.webp) | [After](review/experience-v2/v2-desktop-archive.webp) |

## Media needed

| Area | Editorial input required |
| --- | --- |
| Film cards | Approved posters or stills with credits and localized alt text. Review genre tags against each film’s verified metadata. |
| Film previews | Rights-cleared excerpts, public media URLs and captions. Preview cards wait for user input before loading the clip. |
| People & Stories | Approved portraits and credits for the archival award recipients and guests. Confirm the 2027 guest roster before publishing profiles. |
| Podcast Studio | Cleared episode recordings, credits, artwork and transcripts. |
| Beyond Cinema | Approved promotional artwork for the exhibition, afterparty, Young Eyes and SoftLanding. Confirm the proposed events before publishing venue or availability claims. |
| 2026 retrospective | Documented photographs, film clips, interview recordings, award-ceremony footage and an aftermovie, with dates, credits, releases and accessible captions. |

Pending asset records stay out of the public cards. The archive currently features verified screenings, awards and press links. Future large recordings and WebVTT files need approved public media URLs or a separately reviewed hosting change because the production uploader currently allows only its existing static file types.

## Verification

The review checks the default build and a local build with `VITE_SITE_ORIGIN=https://www.italyshortfilmdays.com`. The build retains all 231 prerendered URLs and the 30 verified 2026 film records. The future origin is a local configuration check. Hosting and release settings require their own approval.

`npm ci` and the default build passed. All sitemap URLs matched their static HTML, including canonicals, alternates and structured data. Chromium checks covered IT, DE and EN at 320, 390, 768 and 1440 pixels, including keyboard film links, mobile menu Escape, sticky tickets, genre filtering, day and night views, archive navigation, static navigation without JavaScript, and reduced motion. Twelve representative automated accessibility scans reported no violations. Fixtures verified media rights gating and that film previews defer video loading until requested.
