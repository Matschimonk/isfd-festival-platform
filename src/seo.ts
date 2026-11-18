import {
  categories,
  days,
  l,
  localizedEditorialText,
  locales,
  openGraphLocales,
  translate,
  visible,
  type Festival,
  type Film,
  type Locale,
  type Venue,
} from "./content";
import { pages, ui } from "./copy";
import { link, origin, resolvePage, type Route } from "./routes";

const brand = "Italy Short Film Days Berlin";
const artworkAlt = l(
  "Festival artwork in red and black.",
  "Grafica del festival in rosso e nero.",
  "Festivalmotiv in Rot und Schwarz.",
);
const publisher = { "@id": origin + "/#festival-organisation" };
const descriptions = {
  home: ui.intro,
  films: l(
    "Explore short films from the 2026 festival archive and follow the official selection for 2027.",
    "Esplora i cortometraggi dell’archivio 2026 e segui la selezione ufficiale 2027.",
    "Kurzfilme aus dem Festivalarchiv 2026 und Ausblick auf die offizielle Auswahl 2027.",
  ),
  programme: ui.outline,
  academy: l(
    "Discover film education, workshops and conversations for schools, young audiences and filmmakers.",
    "Scopri le attività di formazione, i laboratori e gli incontri per scuole, giovani e professionisti del cinema.",
    "Filmbildung, Workshops und Gespräche für Schulen, junges Publikum und Filmschaffende.",
  ),
  media: l(
    "Read festival press releases, interviews and editorial coverage.",
    "Leggi i comunicati stampa, le interviste e gli approfondimenti sul festival.",
    "Pressemitteilungen, Interviews und redaktionelle Beiträge zum Festival.",
  ),
  venues: ui.venuePending,
  tickets: ui.sale,
  festival: ui.mission,
  archive: l(
    "Explore the films, screenings, venues and awards from the festival’s first edition in 2026.",
    "Scopri i film, le proiezioni, le sedi e i premi della prima edizione del festival nel 2026.",
    "Filme, Vorführungen, Spielorte und Preise der ersten Festivalausgabe 2026.",
  ),
};

export function alternates(route: Route) {
  return locales.map((locale) => ({
    locale,
    url: origin + link(locale, route.page, route.id),
  }));
}

export function pageMetadata(
  data: Festival,
  route: Route | null,
  locale: Locale,
) {
  const { page, id, film, event, venue, article, missing } = resolvePage(
    data,
    route,
  );
  const t = (value: Record<Locale, string>) => translate(value, locale);
  const canonical = origin + link(locale, page, id);
  let title = page === "home" ? t(ui.headline) : t(pages[page]);
  let description = t(descriptions[page]);

  if (film) {
    title = `${film.title} · ${t(ui.filmMeta)}`;
    description =
      localizedEditorialText(film.synopsis, locale) ??
      [
        film.title,
        film.directors?.length
          ? `${t(ui.director)}: ${film.directors.join(", ")}`
          : undefined,
        film.minutes ? `${film.minutes} min` : undefined,
        `${t(pages.archive)} ${film.edition}`,
      ]
        .filter(Boolean)
        .join(" · ");
  } else if (event) {
    title = `${t(event.title)} · ${t(days[event.day])}`;
    description = [
      title,
      t(categories[event.category]),
      event.edition === 2027 ? t(ui.outline) : undefined,
      event.description ? t(event.description) : undefined,
    ]
      .filter(Boolean)
      .join(" · ");
  } else if (venue) {
    title = `${venue.name} · ${t(pages.venues)}`;
    description = `${venue.name} · ${t(ui.city)} · ${t(pages.archive)} ${venue.edition}`;
  } else if (article) {
    title = t(article.title);
    description = t(article.summary);
  }
  if (missing) title = description = t(ui.notFound);
  return { title: `${title} | ${brand}`, description, canonical, missing };
}

function venueSchema(venue: Venue, locale: Locale) {
  return {
    "@type": "MovieTheater",
    "@id": origin + link(locale, "venues", venue.id) + "#venue",
    url: origin + link(locale, "venues", venue.id),
    name: venue.name,
    address: venue.address,
    hasMap: venue.map,
  };
}

function filmSchema(film: Film, locale: Locale) {
  const url = origin + link(locale, "films", film.id);
  return {
    "@type": "Movie",
    "@id": url + "#film",
    url,
    name: film.title,
    description: localizedEditorialText(film.synopsis, locale),
    director: film.directors?.map((name) => ({ "@type": "Person", name })),
    duration: film.minutes ? `PT${film.minutes}M` : undefined,
  };
}

export function structuredData(data: Festival, route: Route, locale: Locale) {
  const { page, film, venue } = resolvePage(data, route);
  const { title, canonical, description } = pageMetadata(data, route, locale);
  const archiveUrl = origin + link(locale, "archive");
  const organisation = {
    "@type": "Organization",
    ...publisher,
    name: brand,
    url: origin + "/",
  };
  let mainEntity: object | undefined;

  if (film) mainEntity = filmSchema(film, locale);
  if (venue) mainEntity = venueSchema(venue, locale);
  if (page === "archive") {
    const edition = data.editions.find(
      (item) => item.year === 2026 && visible(item),
    );
    if (edition?.starts && edition.ends && edition.source) {
      const venues = data.venues.filter(
        (item) => item.edition === 2026 && item.source && visible(item),
      );
      const screenings = data.screenings.flatMap((screening) => {
        if (
          screening.edition !== 2026 ||
          !visible(screening) ||
          !screening.date ||
          !screening.source
        )
          return [];
        const location = venues.find((item) => item.id === screening.venueId);
        if (!location) return [];
        // Times refer to the whole programme block. A date avoids assigning a film to an unverified slot.
        return [
          {
            "@type": "ScreeningEvent",
            "@id": `${archiveUrl}#${screening.id}`,
            name: translate(screening.title, locale),
            startDate: screening.date,
            location: venueSchema(location, locale),
            workPresented: data.films
              .filter(
                (item) => visible(item) && screening.filmIds.includes(item.id),
              )
              .map((item) => filmSchema(item, locale)),
          },
        ];
      });
      mainEntity = {
        "@type": "Festival",
        "@id": archiveUrl + "#2026",
        name: brand + " 2026",
        startDate: edition.starts,
        endDate: edition.ends,
        location: venues.map((item) => venueSchema(item, locale)),
        subEvent: screenings,
      };
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      organisation,
      {
        "@type": "WebSite",
        "@id": origin + "/#website",
        url: origin + "/",
        name: brand,
        inLanguage: [...locales],
        publisher,
      },
      {
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        url: canonical,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": origin + "/#website" },
        mainEntity,
      },
    ],
  };
}

export function escapeMarkup(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderHead(data: Festival, route: Route, locale: Locale) {
  const { title, description, canonical } = pageMetadata(data, route, locale);
  const esc = escapeMarkup;
  const image = origin + "/images/hero.webp";
  const jsonLd = JSON.stringify(structuredData(data, route, locale)).replaceAll(
    "<",
    "\\u003c",
  );
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    '<meta name="robots" content="index,follow" />',
    `<link rel="canonical" href="${esc(canonical)}" />`,
    ...alternates(route).map(
      ({ locale: lang, url }) =>
        `<link rel="alternate" hreflang="${lang}" href="${esc(url)}" />`,
    ),
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:locale" content="${openGraphLocales[locale]}" />`,
    ...locales
      .filter((lang) => lang !== locale)
      .map(
        (lang) =>
          `<meta property="og:locale:alternate" content="${openGraphLocales[lang]}" />`,
      ),
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:type" content="image/webp" />',
    '<meta property="og:image:width" content="2100" />',
    '<meta property="og:image:height" content="700" />',
    `<meta property="og:image:alt" content="${esc(artworkAlt[locale])}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(artworkAlt[locale])}" />`,
    `<script id="structured-data" type="application/ld+json">${jsonLd}</script>`,
  ].join("\n    ");
}
