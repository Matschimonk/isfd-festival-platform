# PR #3 pre-merge review

Review started at commit `b026628`. The follow-up in the same PR records evidence-based archive corrections and layout fixes. Production release was excluded from this review.

| Area | Classification | Result |
| --- | --- | --- |
| Archive | PASS | All 30 titles, directors, and listed runtimes checked. The four days, three venues and official award recipients match the sources below. |
| Trilingual UI | PASS | Italian, German and English copy reviewed. Day and category filters have explicit labels, and English dates follow UK formatting. Language changes retain the route. |
| Responsive UX | PASS | Narrow-screen headings wrap within the viewport, and the mobile menu and homepage actions have 44px-tall targets. |
| Build and SEO | PASS | The build emits 216 canonical pages and an English root homepage. The sitemap matches the generated routes and their alternate URLs. |
| Unresolved editorial details | WARNING | Two per-film showtimes conflict across official programme editions. Several optional content fields and 2027 programme details remain open. |
| Deployment code | PASS in fixture | The scripts accepted the static release and rejected an unexpected file, wrong marker, and a symlinked nested route directory. |
| Live release | BLOCKER to proceeding with deployment-enabled merge | The Hostinger directory mapping and recoverable backup for this release were outside the available verification scope. |

## 2026 archive evidence

The Italian programme’s four date tabs list 30 films with directing credits and runtimes. The festival retrospective confirms the same film groups and venues. The English programme lists fewer individual films. Programme times below refer to Berlin local time and are shown as block start times. [Italian screening programme](https://www.italyshortfilmdays.com/it/program) · [English screening programme](https://www.italyshortfilmdays.com/en/program) · [Official retrospective](https://www.italyshortfilmdays.com/en/experience) · [TaxiDrivers programme](https://www.taxidrivers.it/533140/italy-short-film-days/italy-short-film-days-berlin-screening-programm.html)

| Date | Venue | Films | Block start times |
| --- | --- | ---: | --- |
| 4 June | Lichtblick Kino | 6 | 19:00 and 21:30 |
| 5 June | IL KINO | 8 | 18:30 and 21:30 |
| 6 June | ACUD Kino | 8 | 19:00 |
| 7 June | ACUD Kino | 8 | 19:00 |

- Added 23 previously blank runtimes. The values in the archive describe the festival programme’s listed versions.
- *Juggernaut* is credited to Daniele Ricci and Emanuele Ricci. The Italian programme and festival selection agree with the Giove festival’s credit, which identifies Eugenio Krilov as the lead. The Berlin retrospective lists Krilov in the film’s directing slot. [Festival selection](https://www.italyshortfilmdays.com/it/line) · [Giove Short Film Festival](https://www.gioveshortfilmfestival.it/en/juggernaut/)
- *Fiji* is credited to Andrea Lamedica, matching the programme and distributor. *Quand tu dors* identifies Pierluigi Rosa and Salvator Rosa by name. The retrospective uses their collective credit, Fratelli Rosa. [Lights On](https://www.lightsonfilm.com/fiji.html) · [Festival del Cinema Europeo](https://www.festivaldelcinemaeuropeo.com/en/?p=12314)
- Checked the seven award entries against the festival’s published palmarès and ANSA. The Special Guest Award entry names both recipients. The separate CinemaItaliano.info recognition for *Playing God* is outside the festival’s official awards list. [Festival palmarès](https://www.italyshortfilmdays.com/it/experience) · [ANSA](https://www.ansa.it/amp/sito/notizie/cultura/cinema/2026/06/10/il-corto-majoneze-di-giulia-grandinetti-premiato-a-berlino-per-italy-short-film_db4b0caa-f78c-45fa-a8f5-22b37e8a9597.html) · [CinemaItaliano.info](https://www.cinemaitaliano.info/news/91841/italy-short-film-days-berlin-1-i-premi.html)

### Open editorial questions

- Confirm individual showtimes for *Parru pi tia* on 4 June (English programme lists 19:00, Italian lists both starts) and *Aspis* on 5 June (English lists 19:00 as the first start, Italian lists 18:30). Day and venue assignments agree. The site publishes only the block times.
- If individual Special Guest presentation times are needed, check the post-event record with the team. The advance TaxiDrivers programme assigns the awards to earlier nights. The official retrospective and ANSA describe the closing ceremony.
- Several archive films still need editor-approved synopses, translations, and rights-cleared artwork. Some venue accessibility details remain pending. Confirm exact 2027 dates, venues, selection, and ticket and registration links before promoting those details.

## Verification

`npm ci` and `npm run build` passed. A local HTTP server returned matching static HTML for all 216 sitemap URLs. The sitemap protocol XSD, reciprocal language links, canonical URLs, Open Graph metadata, and JSON-LD were checked. The review also tested the localized fallback for a missing synopsis and for a synopsis available in other languages only.

Chromium covered direct access, refresh, language switching, legacy links, mobile menus, all seven programme filters and no-JavaScript pages. The final sweep ran 210 layout checks from 320px to 1440px and 36 automated WCAG scans without reported violations. The PR build contains no fictional demo films or their images. A read-only check confirmed that the live homepage still serves the older JavaScript bundle containing demo-film titles.

## Production readiness and rollback

The PR workflow never deploys from a pull request. A push to `main` can deploy immediately if `FESTIVAL_DEPLOY_ENABLED` is set, so merging into deployment-enabled `main` is a release action.

The publishing scripts restrict uploads to the generated assets, imagery, sitemap, and allowlisted language routes. They pin the SSH host key, check the production marker and parent-domain marker, verify the physical remote root and its marker, and preflight each destination path for symlinks. The local fixture exercises file, marker, and path refusal without contacting Hostinger. SSH pinning was confirmed by code inspection. The parent HTTP check detects a matching marker at the configured comparison URL. The live document root, alias mapping, and parent route behaviour still need confirmation in Hostinger. The checkout under `github-source/` is outside the upload set, and its public access restrictions depend on hosting.

The uploader replaces each file atomically and installs the root index last. It has no whole-site transaction or automatic rollback. A failed or reverted release can leave files from both releases. Replaying a previous artifact restores only the paths that it contains. The older pre-prerender artifact also requires its matching publisher because the current uploader expects localized pages and a sitemap. New paths, withdrawn pages, and superseded demo assets require separate cleanup, so rollback depends on a restorable copy of the festival document root and a record of the added paths. GitHub build artifacts are retained for seven days.

**Recommendation** — GO for review. NO-GO for merging into deployment-enabled `main` until the live root and aliases are confirmed and a festival-only snapshot and rollback plan are ready.
