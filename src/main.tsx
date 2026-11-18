/// <reference types="vite/client" />
import { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource-variable/inter/wght.css";
import { repository } from "./archive";
import {
  categories,
  days,
  defaultLocale,
  isLocale,
  localeNames,
  locales,
  localizedEditorialText,
  openGraphLocales,
  themes,
  translate,
  visible,
  type Category,
  type Festival,
  type FestivalEvent,
  type Film,
  type Locale,
  type LocalizedContent,
  type Screening,
} from "./content";
import { mediaKinds, pages, ui } from "./copy";
import "./style.css";

const site = "https://italyshortfilmdays2027.rawdrivers.org";
const params = new URLSearchParams(location.search);
const section = params.get("page") ?? "home";
const detail = params.get("id");
const initialLocale = params.get("lang");
type Page = keyof typeof pages;
type T = (text: LocalizedContent) => string;
const isPage = (value: string): value is Page => Object.hasOwn(pages, value);

function link(locale: Locale, page: Page = "home", id?: string) {
  const query = new URLSearchParams();
  if (page !== "home") query.set("page", page);
  if (id) query.set("id", id);
  query.set("lang", locale);
  return "?" + query.toString();
}

function Brand({ locale }: { locale: Locale }) {
  return (
    <a className="brand" href={link(locale)}>
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        ITALY SHORT
        <br />
        FILM DAYS <b>BERLIN</b>
      </span>
    </a>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="panel">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}
function dateLabel(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}
function FilmList({ films, locale }: { films: Film[]; locale: Locale }) {
  return (
    <ul className="card-grid film-grid">
      {films.filter(visible).map((film) => (
        <li key={film.id}>
          <a className="tile" href={link(locale, "films", film.id)}>
            {film.poster && <img src={film.poster} alt="" loading="lazy" />}
            <span>
              <strong>{film.title}</strong>
              {film.directors && <small>{film.directors.join(", ")}</small>}
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
function ScreeningList({
  screenings,
  data,
  locale,
  t,
  filmId,
}: {
  screenings: Screening[];
  data: Festival;
  locale: Locale;
  t: T;
  filmId?: string;
}) {
  return (
    <div className="card-grid">
      {screenings.map((screening) => {
        const venue = data.venues.find(
          (v) => v.id === screening.venueId && visible(v),
        );
        const films = data.films.filter(
          (f) => screening.filmIds.includes(f.id) && visible(f),
        );
        return (
          <Panel key={screening.id} title={t(screening.title)}>
            {screening.date && <p>{dateLabel(screening.date, locale)}</p>}
            {venue && (
              <a className="text-link" href={link(locale, "venues", venue.id)}>
                {venue.name}
              </a>
            )}
            {screening.times && screening.times.length > 0 && (
              <p>
                {screening.times.join(" / ")}
                <br />
                <small>{t(ui.historicalTimes)}</small>
              </p>
            )}
            {!filmId && (
              <ul>
                {films.map((f) => (
                  <li key={f.id}>
                    <a href={link(locale, "films", f.id)}>{f.title}</a>
                  </li>
                ))}
              </ul>
            )}
            {screening.source && (
              <External href={screening.source}>{t(ui.source)}</External>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
function Programme({
  data,
  locale,
  t,
}: {
  data: Festival;
  locale: Locale;
  t: T;
}) {
  const [day, setDay] = useState<number | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const selected = data.events.filter(
    (event) =>
      visible(event) &&
      event.edition === 2027 &&
      (day === "all" || day === event.day) &&
      (category === "all" || category === event.category),
  );
  return (
    <>
      <p>{t(ui.outline)}</p>
      <div className="filters">
        <label>
          {t(ui.day)}
          <select
            aria-label={t(ui.day)}
            value={day}
            onChange={(e) =>
              setDay(e.target.value === "all" ? "all" : Number(e.target.value))
            }
          >
            <option value="all">{t(ui.all)}</option>
            {days.map((value, i) => (
              <option key={i} value={i}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(ui.category)}
          <select
            aria-label={t(ui.category)}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
          >
            <option value="all">{t(ui.all)}</option>
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="schedule" aria-live="polite">
        {selected.length === 0 && <p>{t(ui.empty)}</p>}
        {days.map((value, i) => {
          const items = selected.filter((event) => event.day === i);
          return (
            items.length > 0 && (
              <section className="schedule-day" key={i}>
                <div>
                  <div className="eyebrow">{t(value)}</div>
                  <h2>{t(themes[i])}</h2>
                </div>
                <ul>
                  {items.map((event) => (
                    <li key={event.id}>
                      <a
                        className="schedule-link"
                        href={link(locale, "programme", event.id)}
                      >
                        <span>
                          {t(event.title)}
                          <small>
                            {t(categories[event.category])}
                            {event.period &&
                              " · " +
                                t(
                                  ui[
                                    event.period === "day" ? "daytime" : "night"
                                  ],
                                )}
                          </small>
                        </span>
                        <ArrowRight size={17} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )
          );
        })}
      </div>
    </>
  );
}
function EventDetails({
  event,
  data,
  locale,
  t,
}: {
  event: FestivalEvent;
  data: Festival;
  locale: Locale;
  t: T;
}) {
  const venue = data.venues.find((v) => v.id === event.venueId && visible(v));
  const participants = data.people.filter(
    (p) => event.participants?.includes(p.id) && visible(p),
  );
  const films = data.films.filter((f) => event.filmIds?.includes(f.id));
  return (
    <>
      <div className="eyebrow">
        {event.edition} · {t(days[event.day])} · {t(categories[event.category])}
      </div>
      {event.period && (
        <p>{t(ui[event.period === "day" ? "daytime" : "night"])}</p>
      )}
      <p>
        {[event.date && dateLabel(event.date, locale), event.time]
          .filter(Boolean)
          .join(" · ") || t(ui.outline)}
      </p>
      {event.description && <p>{t(event.description)}</p>}
      {venue && (
        <p>
          <a className="text-link" href={link(locale, "venues", venue.id)}>
            {venue.name}
          </a>
        </p>
      )}
      {participants.length > 0 && (
        <p>
          {t(ui.participants)} · {participants.map((p) => p.name).join(", ")}
        </p>
      )}
      {films.length > 0 && <FilmList films={films} locale={locale} />}
      {event.registration && (
        <External href={event.registration}>{t(ui.ticket)}</External>
      )}
    </>
  );
}
function FilmDetails({
  film,
  data,
  locale,
  t,
}: {
  film: Film;
  data: Festival;
  locale: Locale;
  t: T;
}) {
  const synopsis = localizedEditorialText(film.synopsis, locale);
  const rows = [
    [ui.director, film.directors?.join(", ")],
    [ui.year, film.year],
    [ui.country, film.country && t(film.country)],
    [ui.runtime, film.minutes && film.minutes + " min"],
    [ui.original, film.language && t(film.language)],
    [ui.subtitles, film.subtitles && t(film.subtitles)],
    [ui.cast, film.cast?.join(", ")],
    [ui.crew, film.crew?.join(", ")],
  ] as const;
  const screenings = data.screenings.filter(
    (s) => visible(s) && s.filmIds.includes(film.id),
  );
  const awards = data.awards.filter((a) => visible(a) && a.filmId === film.id);
  return (
    <>
      <div className="eyebrow">{film.edition}</div>
      {film.poster && <img className="detail-image" src={film.poster} alt="" />}
      <dl className="metadata">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label.en}>
              <dt>{t(label)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      {synopsis ? (
        <p>{synopsis}</p>
      ) : (
        <p>{t(film.synopsis ? ui.translationPending : ui.unknown)}</p>
      )}
      {film.stills?.map((src) => (
        <img
          className="detail-image"
          key={src}
          src={src}
          alt=""
          loading="lazy"
        />
      ))}
      {film.trailer && (
        <p>
          <External href={film.trailer}>{t(ui.trailer)}</External>
        </p>
      )}
      {screenings.length > 0 && (
        <section>
          <h2>{t(ui.screening)}</h2>
          <ScreeningList
            screenings={screenings}
            data={data}
            locale={locale}
            t={t}
            filmId={film.id}
          />
        </section>
      )}
      {awards.length > 0 && (
        <section>
          <h2>{t(ui.award)}</h2>
          <ul>
            {awards.map((a) => (
              <li key={a.id}>
                {t(a.title)} · {a.recipient}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p>
        {film.source && <External href={film.source}>{t(ui.source)}</External>}{" "}
        {film.links?.map((url) => (
          <External key={url} href={url}>
            {t(ui.external)}
          </External>
        ))}
      </p>
    </>
  );
}
function Media({
  data,
  t,
  featured = false,
}: {
  data: Festival;
  t: T;
  featured?: boolean;
}) {
  const [kind, setKind] = useState<keyof typeof mediaKinds | "all">("all");
  const articles = data.articles.filter(
    (a) => visible(a) && (kind === "all" || a.kind === kind),
  );
  const podcasts = data.podcasts.filter(
    (p) => visible(p) && (kind === "all" || kind === "podcast"),
  );
  return (
    <>
      {!featured && (
        <div className="filters">
          <label>
            {t(ui.category)}
            <select
              aria-label={t(ui.category)}
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              <option value="all">{t(ui.all)}</option>
              {Object.entries(mediaKinds).map(([key, value]) => (
                <option key={key} value={key}>
                  {t(value)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="card-grid">
        {articles.slice(0, featured ? 2 : undefined).map((a) => (
          <Panel key={a.id} title={t(a.title)}>
            <div className="eyebrow">{t(mediaKinds[a.kind])}</div>
            <p>{t(a.summary)}</p>
            <External href={a.url}>{t(ui.read)}</External>
          </Panel>
        ))}
        {podcasts.map((p) => (
          <Panel key={p.id} title={t(p.title)}>
            {p.url && <External href={p.url}>{t(ui.read)}</External>}
          </Panel>
        ))}
      </div>
      {articles.length + podcasts.length === 0 && <p>{t(ui.coming)}</p>}
    </>
  );
}
function Home({ data, locale, t }: { data: Festival; locale: Locale; t: T }) {
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="eyebrow">
            <span />
            {t(ui.date)}
          </div>
          <h1>{t(ui.headline)}</h1>
          <p>{t(ui.intro)}</p>
          <div className="hero-actions">
            <a className="primary" href={link(locale, "programme")}>
              {t(pages.programme)}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="secondary" href={link(locale, "archive")}>
              {t(ui.archive)}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="exact">{t(ui.exact)}</p>
        </div>
      </section>
      <div className="shell page-body">
        <section aria-labelledby="week">
          <div className="eyebrow">{t(ui.edition)}</div>
          <h2 id="week">{t(ui.week)}</h2>
          <ol className="week-grid">
            {days.map((value, i) => (
              <li key={i}>
                <small>{t(value)}</small>
                <strong>{t(themes[i])}</strong>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="home-media">
          <h2 id="home-media">{t(pages.media)}</h2>
          <Media data={data} t={t} featured />
        </section>
      </div>
    </>
  );
}
const descriptions = {
  home: ui.intro,
  films: {
    ...ui.selection,
    de: "Offizielle Auswahl 2027 und Kurzfilme aus dem Festivalarchiv 2026.",
  },
  programme: ui.outline,
  academy: {
    ...themes[1],
    de: "Filmbildung, Workshops und Gespräche für Schulen, junges Publikum und Filmschaffende.",
  },
  media: {
    ...pages.media,
    de: "Pressemitteilungen, Interviews und redaktionelle Beiträge zum Festival.",
  },
  venues: ui.venuePending,
  tickets: ui.sale,
  festival: ui.mission,
  archive: {
    ...ui.archive,
    de: "Filme, Vorführungen, Spielorte und Preise der ersten Festivalausgabe 2026.",
  },
};
function useMetadata({
  locale,
  page,
  title,
  description,
  film,
  missing,
}: {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
  film?: Film;
  missing: boolean;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = title + " | Italy Short Film Days Berlin";
    function meta(selector: string, value: string) {
      document.querySelector(selector)?.setAttribute("content", value);
    }
    meta('meta[name="description"]', description);
    meta('meta[name="robots"]', missing ? "noindex" : "index,follow");
    meta('meta[property="og:title"]', document.title);
    meta('meta[property="og:description"]', description);
    meta(
      'meta[property="og:url"]',
      site + "/" + link(locale, page, detail ?? undefined),
    );
    meta('meta[property="og:locale"]', openGraphLocales[locale]);
    const alternates = locales.filter((lang) => lang !== locale);
    document
      .querySelectorAll('meta[property="og:locale:alternate"]')
      .forEach((tag, index) =>
        tag.setAttribute("content", openGraphLocales[alternates[index]]),
      );
    meta('meta[name="twitter:title"]', document.title);
    meta('meta[name="twitter:description"]', description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        site + "/" + link(locale, page, detail ?? undefined),
      );
    for (const lang of locales)
      document
        .querySelector('link[hreflang="' + lang + '"]')
        ?.setAttribute(
          "href",
          site + "/" + link(lang, page, detail ?? undefined),
        );
    const schema = document.querySelector("#structured-data");
    if (schema)
      schema.textContent = JSON.stringify(
        film
          ? {
              "@context": "https://schema.org",
              "@type": "Movie",
              name: film.title,
              director: film.directors?.map((name) => ({
                "@type": "Person",
                name,
              })),
              duration: film.minutes ? `PT${film.minutes}M` : undefined,
            }
          : {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Italy Short Film Days Berlin",
              url: site,
              inLanguage: locale,
            },
      );
  }, [locale, page, title, description, film, missing]);
}
function App() {
  const [locale] = useState<Locale>(() => {
    if (isLocale(initialLocale)) return initialLocale;
    try {
      const saved = localStorage.getItem("festival-locale");
      return isLocale(saved) ? saved : defaultLocale;
    } catch {
      return defaultLocale;
    }
  });
  const [data, setData] = useState<Festival>();
  const [failed, setFailed] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    repository
      .getFestival()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("festival-locale", locale);
    } catch {}
  }, [locale]);
  const t: T = (text) => translate(text, locale);
  const page = isPage(section) ? section : "home";
  const film =
    detail && page === "films"
      ? data?.films.find((f) => f.id === detail && visible(f))
      : undefined;
  const event =
    detail && page === "programme"
      ? data?.events.find((e) => e.id === detail && visible(e))
      : undefined;
  const venue =
    detail && page === "venues"
      ? data?.venues.find((v) => v.id === detail && visible(v))
      : undefined;
  const missing =
    !isPage(section) || Boolean(data && detail && !film && !event && !venue);
  const title = missing
    ? t(ui.notFound)
    : (film?.title ??
      (event
        ? t(event.title)
        : (venue?.name ??
          (page === "home" ? t(ui.headline) : t(pages[page])))));
  const description = missing
    ? t(ui.notFound)
    : film
      ? (localizedEditorialText(film.synopsis, locale) ??
        film.title + " · " + t(ui.lineup))
      : t(descriptions[page]);
  useMetadata({ locale, page, title, description, film, missing });
  let body: ReactNode;
  if (!data)
    body = (
      <p role={failed ? "alert" : "status"}>
        {t(failed ? ui.error : ui.loading)}
      </p>
    );
  else if (missing)
    body = (
      <p>
        <a className="text-link" href={link(locale)}>
          {t(pages.home)}
        </a>
      </p>
    );
  else if (film)
    body = <FilmDetails film={film} data={data} locale={locale} t={t} />;
  else if (event)
    body = <EventDetails event={event} data={data} locale={locale} t={t} />;
  else if (venue)
    body = (
      <>
        <p>
          {venue.edition} · {t(ui.city)}
        </p>
        {venue.address && <p>{venue.address}</p>}
        <p>{venue.accessibility ? t(venue.accessibility) : t(ui.access)}</p>
        {venue.map && <External href={venue.map}>{t(ui.map)}</External>}
        {venue.source && (
          <p>
            <External href={venue.source}>{t(ui.source)}</External>
          </p>
        )}
      </>
    );
  else
    switch (page) {
      case "programme":
        body = <Programme data={data} locale={locale} t={t} />;
        break;
      case "films":
        body = (
          <>
            <Panel title={t(ui.selection)}>
              <p>{t(ui.coming)}</p>
            </Panel>
            <section>
              <h2>{t(ui.lineup)}</h2>
              <FilmList
                films={data.films.filter((f) => f.edition === 2026)}
                locale={locale}
              />
            </section>
          </>
        );
        break;
      case "academy":
        body = (
          <>
            <p>{t(ui.outline)}</p>
            <ul className="card-grid">
              {data.events
                .filter(
                  (e) =>
                    visible(e) &&
                    e.edition === 2027 &&
                    (e.category === "education" || e.category === "industry"),
                )
                .map((e) => (
                  <li key={e.id}>
                    <a className="tile" href={link(locale, "programme", e.id)}>
                      {t(e.title)}
                      <ArrowRight size={17} aria-hidden="true" />
                    </a>
                  </li>
                ))}
            </ul>
            {data.workshops.filter(visible).map((w) => (
              <Panel key={w.id} title={t(w.title)}>
                {w.description && <p>{t(w.description)}</p>}
                {w.registration && (
                  <External href={w.registration}>{t(ui.register)}</External>
                )}
              </Panel>
            ))}
          </>
        );
        break;
      case "media":
        body = <Media data={data} t={t} />;
        break;
      case "venues":
        body = (
          <>
            <p>{t(ui.venuePending)}</p>
            <h2>{t(ui.historical)}</h2>
            <ul className="card-grid">
              {data.venues.filter(visible).map((v) => (
                <li key={v.id}>
                  <a className="tile" href={link(locale, "venues", v.id)}>
                    {v.name}
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        );
        break;
      case "tickets": {
        const offers = data.tickets.filter(
          (o) => visible(o) && o.edition === 2027,
        );
        body = (
          <>
            {offers.length === 0 ? (
              <Panel title={t(ui.coming)}>
                <p>{t(ui.sale)}</p>
              </Panel>
            ) : (
              offers.map((o) => (
                <Panel key={o.id} title={t(o.label)}>
                  {o.url && <External href={o.url}>{t(ui.ticket)}</External>}
                </Panel>
              ))
            )}
          </>
        );
        break;
      }
      case "festival":
        body = (
          <>
            <p>{t(ui.mission)}</p>
            <div className="card-grid">
              <Panel title={t(ui.people)}>
                <p>{t(ui.dates)}</p>
                {data.people.filter(visible).map((p) => (
                  <p key={p.id}>
                    {p.name}
                    {p.role && " · " + t(p.role)}
                  </p>
                ))}
              </Panel>
              <Panel title={t(ui.partners)}>
                {data.partners.filter(visible).map((p) => (
                  <p key={p.id}>
                    {p.url ? (
                      <External href={p.url}>{p.name}</External>
                    ) : (
                      p.name
                    )}{" "}
                    · {p.edition}
                  </p>
                ))}
              </Panel>
            </div>
            <p>
              <a className="text-link" href={link(locale, "archive")}>
                {t(ui.archive)} <ArrowRight size={17} />
              </a>
            </p>
          </>
        );
        break;
      case "archive": {
        const edition = data.editions.find(
          (e) => e.year === 2026 && visible(e),
        );
        body = (
          <>
            {edition && <div className="eyebrow">{t(edition.label)}</div>}
            <section>
              <h2>{t(ui.screening)}</h2>
              <ScreeningList
                screenings={data.screenings.filter(
                  (s) => s.edition === 2026 && visible(s),
                )}
                data={data}
                locale={locale}
                t={t}
              />
            </section>
            <section>
              <h2>{t(ui.award)}</h2>
              <ul className="card-grid">
                {data.awards
                  .filter((a) => a.edition === 2026 && visible(a))
                  .map((a) => (
                    <li className="panel" key={a.id}>
                      <strong>{t(a.title)}</strong>
                      <p>{a.recipient}</p>
                      {a.filmId && (
                        <a
                          className="text-link"
                          href={link(locale, "films", a.filmId)}
                        >
                          {data.films.find((f) => f.id === a.filmId)?.title}
                        </a>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
            <section>
              <h2>{t(ui.lineup)}</h2>
              <FilmList
                films={data.films.filter((f) => f.edition === 2026)}
                locale={locale}
              />
            </section>
          </>
        );
        break;
      }
    }
  return (
    <>
      <a className="skip-link" href="#content">
        {t(ui.skip)}
      </a>
      <header className="header">
        <div className="shell header-inner">
          <Brand locale={locale} />
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menu}
            aria-controls="main-nav"
            onClick={() => setMenu(!menu)}
          >
            {t(ui.menu)}
          </button>
          <nav
            id="main-nav"
            className={menu ? "nav-open" : ""}
            aria-label={t(ui.nav)}
          >
            {(Object.keys(pages) as Page[]).map((key) => (
              <a
                key={key}
                aria-current={page === key && !missing ? "page" : undefined}
                href={link(locale, key)}
              >
                {t(pages[key])}
              </a>
            ))}
          </nav>
          <div className="languages" role="group" aria-label={t(ui.language)}>
            {locales.map((lang) => (
              <a
                key={lang}
                href={link(lang, page, detail ?? undefined)}
                lang={lang}
                aria-label={localeNames[lang]}
                aria-current={locale === lang ? "true" : undefined}
              >
                {lang.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </header>
      <main id="content" tabIndex={-1}>
        {page === "home" && !missing && data ? (
          <Home data={data} locale={locale} t={t} />
        ) : (
          <div className="shell page-body">
            {detail && !missing && (
              <a className="text-link back" href={link(locale, page)}>
                ← {t(pages[page])}
              </a>
            )}
            <h1>{title}</h1>
            {body}
          </div>
        )}
      </main>
      <footer className="shell footer">
        <Brand locale={locale} />
        <span>{t(ui.date)}</span>
        <a href={link(locale, "archive")}>{t(ui.archive)}</a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
