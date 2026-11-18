# Director’s Presentation

**One week. Many stories.** The preview proposes an editorial home for Italian short cinema in Berlin. Seven chapters take the audience from the first screenings to the conversations, exhibitions and people around them. The 2026 archive grounds the proposal in the festival’s recorded history.

The visual identity uses a lens-ring motif, cream typesetting and warm red highlights. Day uses a printed programme palette. Night uses the atmosphere of a cinema foyer. Both use the same layout and content. The rings and title sequence move gently where the visitor’s preferences allow it. The year, photography and title can change between editions. The existing artwork and graphic fallback frames distinguish editorial treatments from festival documentation.

## Short walkthrough

1. Open the homepage with `npm ci` and `npm run dev`. Start on Discover. Switch between day and night in the header. The choice follows you across routes and language changes.
2. Open a day in the seven-day story, then explore the programme filters and day/night timetable. Open a verified film through Films & Events. Try the archive chapters, awards and press links.
3. Use the 2026 trailer button in Discover or Archive. The YouTube player loads only after activation. A direct YouTube link remains available if the player is blocked. [2026 trailer](https://www.youtube.com/watch?v=kCt7OSTjVGY)
4. Open People & Stories for verified archival profiles and the Podcast Studio. Beyond Cinema leads to the proposed exhibition, afterparty and brunch. Young Eyes and Visit show school and venue information.
5. Try the Tickets QR code and submit the newsletter form with a test address. The QR resolves to the labelled ticket demo on the current preview host. The form validates locally and clears the test email.
6. Run `npm run studio:v3` separately and open `http://127.0.0.1:4190/`. Create a working record, switch the record preview language, and export or import the review JSON. Keep the tab open while editing. The studio uses memory and exported files and stays outside the website build.

## Page inventory

All public routes below are produced in Italian, German and English. Prefix examples with `/it/`, `/de/` or `/en/`. The existing root fallback and legacy query-link behavior remain available.

| Route | Content |
| --- | --- |
| `/` within a language | Discover, hero, trailer, seven-day overview, feature cards |
| `films/` and `films/{id}/` | Genre explorer, catalogue, 30 verified film pages |
| `programme/` and `programme/{id}/` | Seven days, timetable and proposed 2027 events, exhibition, AfterParty, SoftLanding |
| `academy/` | People & Stories, directors, actors, Podcast Studio and Young Eyes |
| `archive/` | 2026 trailer, verified screenings, films, awards, press and media slots |
| `festival/` | About, mission, historical guests and partners |
| `partners/` | Cultural positioning, opportunity formats, 2026 partner context, contact, PDF slot |
| `media/` and `media/{id}/` | Press and editorial content |
| `venues/` and `venues/{id}/` | Visit, festival map preview and verified 2026 venues |
| `contact/` | Published editorial and partnership contact |
| `newsletter/` | Validation preview and local privacy explanation |
| `tickets/` | Proposed categories and `#ticket-demo` QR destination |

## What works today

| Review-ready | Demo or pending approval |
| --- | --- |
| Responsive navigation, sticky Tickets, keyboard film links, language switching, accessible theme control, persisted preferences, reduced motion, and static pages | Proposed 2027 dates, timetable, exhibition, bar, school programming, prices, registration and venue map |
| Programme and genre-filter interactions, archive links, and rights-gated poster and excerpt slots | Approved genre tags, film stills and clips, portraits, aftermovie, interviews and podcast episodes |
| Trailer consent layer and outbound fallback | External YouTube playback availability and embedding permission must be checked from the presentation environment |
| Ticket destination and QR, native email/consent checks, JSON import/export with localized record preview | Sales and booking, live payment link, Brevo submission, legal consent and privacy text, editorial synchronization |

The team can set colours in `src/director-preview.css`, replace the key artwork after review, and update localized copy and demo categories. V2 catalogue data stays authoritative for the verified edition. The studio supports films, events, people, partners and media working copies in a versioned JSON envelope. Its local “published” status is a review label. Production publishing requires a separately approved content conversion and the real catalogue’s rights gates.

The team manages rights, translations, source credit, calendar confirmation, ticket policy, partner offers and legal approvals. The sponsor section includes only previous-edition names supported by the official festival site. A current presentation PDF was unavailable in the V2 base. Partnership formats are proposals. [2026 festival and sponsor context](https://www.italyshortfilmdays.com/en/about)

## Media, launch and estimated effort

- Supply the approved 2027 identity files and sponsor PDF, and verify the official 2026 YouTube player. Supply authorized source clips separately if the festival wants excerpt editing.
- Clear posters, stills, film excerpts, captions, portraits, archival event footage and podcast recordings. Approve translators’ copy, accessibility details and the privacy notice. Decide how registrations, prices and audience access should work.
- Confirm 2027 dates, programming and partners. Review the separate media integration draft before choosing how to bring approved records into the production stack.
- Before release, obtain separate approval for any Stripe Payment Link and server-only Brevo adapter. The preview keeps checkout disabled and contains no keys or personal-data endpoint. A CMS can consume or replace the studio’s review schema later.
- The current Hostinger publisher has a fixed route allowlist. The three new public sections need review there along with the existing backup and isolation checks. This PR leaves production configuration intact.

Working estimate after the team supplies inputs is **5–9 person-days**. Allow 2–3 for editorial and media intake, 1–2 for approved integration and privacy checks, and 2–4 for final QA, accessibility and controlled release. This is a planning range rather than a price quote. The prototype adds no paid service or backend.

## Verification

- A clean `npm ci` and `npm run build` produced 240 canonical routes across IT, DE and EN, plus the root homepage. All 240 sitemap routes responded from a local static server. The check covered HTML without JavaScript, canonical and hreflang agreement, titles, social metadata, and JSON-LD for films, venues and verified 2026 screenings.
- Chromium checks covered 320, 390 and 1440 pixel viewports, keyboard navigation and focus return, film detail refresh and language switching, reduced motion, and the seven-day programme filters. The persisted theme applied with the React bundle blocked. The archive returned 30 film links in each language.
- Axe reported no WCAG 2/2.1 A or AA violations in 36 automated checks across nine representative pages, both themes, and mobile and desktop layouts. These scans cover the checked pages and states.
- The trailer started with an empty player slot and loaded the configured embed on explicit activation in a test with the external response stubbed. The QR decoded to the correct localized demo destination. The newsletter validated consent and cleared the input without a network submission. Studio import and export passed for all five record collections, and the production artifact did not serve the studio.

## Screenshots

| View | Day | Night |
| --- | --- | --- |
| Desktop Discover | [Day](review/director-preview/day-desktop.webp) | [Night](review/director-preview/night-desktop.webp) |
| Mobile Discover | [Day](review/director-preview/day-mobile.webp) | [Night](review/director-preview/night-mobile.webp) |
