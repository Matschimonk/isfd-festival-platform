import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  categories,
  days,
  localizedEditorialText,
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
import { Brand, Header } from "./Navigation";
import {
  ArchiveFeature,
  FilmCard,
  PeopleStories,
  GenreExplorer,
  HomeFeatures,
  Profile,
  SocialProgramme,
  TalksAndSchools,
} from "./Experience";
import { experience, festivalWeek } from "./experience-content";

import { link, resolvePage, type Page, type Route } from "./routes";

type T = (text: LocalizedContent) => string;

function Panel({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="panel" id={id}>
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
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}
function FilmList({ films, locale }: { films: Film[]; locale: Locale }) {
  return (
    <ul className="card-grid film-grid">
      {films.filter(visible).map((film) => (
        <li key={film.id}>
          <FilmCard film={film} locale={locale} />
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
          <Panel
            key={screening.id}
            id={screening.id}
            title={t(screening.title)}
          >
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
  const [period, setPeriod] = useState<"both" | "day" | "night">("both");
  const selected = data.events.filter(
    (event) =>
      visible(event) &&
      event.edition === 2027 &&
      (day === "all" || day === event.day) &&
      (category === "all" || category === event.category) &&
      (period === "both" || !event.period || period === event.period),
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
            <option value="all">{t(ui.allDays)}</option>
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
            <option value="all">{t(ui.allCategories)}</option>
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="period-switch editorial-filters"
        role="group"
        aria-label={t(experience.rhythm)}
      >
        {(["both", "day", "night"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={period === option}
            onClick={() => setPeriod(option)}
          >
            {t(experience[option])}
          </button>
        ))}
      </div>
      <p className="timeline-help">{t(experience.rhythmHelp)}</p>
      <div
        className="schedule editorial-timeline"
        data-period={period}
        aria-live="polite"
      >
        {selected.length === 0 && <p>{t(ui.empty)}</p>}
        {days.map((value, i) => {
          const items = selected.filter((event) => event.day === i);
          return (
            items.length > 0 && (
              <section className="schedule-day" key={i} id={`day-${i}`}>
                <div>
                  <div className="eyebrow">{t(value)}</div>
                  <h2>{t(festivalWeek[i].title)}</h2>
                  <p>{t(festivalWeek[i].line)}</p>
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
                            {" · " + (event.time ?? t(experience.unscheduled))}
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
      <SocialProgramme locale={locale} />
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
      {event.edition === 2027 && (
        <p className="eyebrow">{t(experience.proposed)}</p>
      )}
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
  locale,
  t,
  featured = false,
}: {
  data: Festival;
  locale: Locale;
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
              <option value="all">{t(ui.allCategories)}</option>
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
            <p>
              <a className="text-link" href={link(locale, "media", a.id)}>
                {t(ui.articleDetails)}
              </a>
            </p>
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
  const [first, second] = t(ui.headline).split(/(?<=\.)\s+/);
  return (
    <>
      <section className="hero experience-hero">
        <div className="shell hero-inner">
          <div className="eyebrow">
            <span />
            {t(ui.date)}
          </div>
          <h1>
            <span>{first}</span> <span>{second}</span>
          </h1>
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
        <HomeFeatures data={data} locale={locale} />
        <section aria-labelledby="home-media">
          <h2 id="home-media">{t(pages.media)}</h2>
          <Media data={data} locale={locale} t={t} featured />
        </section>
      </div>
    </>
  );
}
export function App({
  data,
  route,
  locale,
}: {
  data: Festival;
  route: Route | null;
  locale: Locale;
}) {
  const t: T = (text) => translate(text, locale);
  const { page, id, film, event, venue, article, missing } = resolvePage(
    data,
    route,
  );
  const title = missing
    ? t(ui.notFound)
    : (film?.title ??
      (event && t(event.title)) ??
      venue?.name ??
      (article && t(article.title)) ??
      (page === "home"
        ? t(ui.headline)
        : page === "archive"
          ? t(experience.archiveTitle)
          : t(pages[page])));
  let body: ReactNode;
  if (missing)
    body = (
      <p>
        <a className="text-link" href={link(locale)}>
          {t(pages.home)}
        </a>
      </p>
    );
  else if (article)
    body = (
      <article>
        <div className="eyebrow">{t(mediaKinds[article.kind])}</div>
        <p>{t(article.summary)}</p>
        <External href={article.url}>{t(ui.read)}</External>
      </article>
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
            <p>
              <a className="editorial-link" href={link(locale, "programme")}>
                {t(pages.programme)}{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </p>
            <GenreExplorer data={data} locale={locale} />
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
            <PeopleStories data={data} locale={locale} />
            <TalksAndSchools data={data} locale={locale} />
            <p>{t(ui.outline)}</p>
            <ul className="card-grid">
              {data.events
                .filter(
                  (e) =>
                    visible(e) &&
                    e.edition === 2027 &&
                    (
                      [
                        "education",
                        "industry",
                        "talks",
                        "workshops",
                        "schools",
                      ] as Category[]
                    ).includes(e.category),
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
        body = <Media data={data} locale={locale} t={t} />;
        break;
      case "venues":
        body = (
          <>
            <section className="map-preview panel" id="festival-map">
              <h2>{t(experience.map)}</h2>
              <p>{t(experience.mapIntro)}</p>
            </section>
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
            <section id="guests">
              <h2>{t(experience.guests)}</h2>
              <p>{t(experience.guestPending)}</p>
              <ul className="editorial-topics">
                {experience.guestRoles.map((role) => (
                  <li key={role.en}>{t(role)}</li>
                ))}
              </ul>
            </section>
            <div className="card-grid">
              <Panel title={t(ui.people)}>
                <p>{t(ui.dates)}</p>
                {data.people.filter(visible).map((p) => (
                  <Profile key={p.id} person={p} locale={locale} />
                ))}
              </Panel>
              <Panel title={t(ui.partners)} id="partners">
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
            <ArchiveFeature data={data} locale={locale} />
            {edition && (
              <div className="eyebrow" id="2026">
                {t(edition.label)}
              </div>
            )}
            <section id="archive-screenings">
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
            <section id="archive-awards">
              <h2>{t(ui.award)}</h2>
              <ul className="card-grid">
                {data.awards
                  .filter((a) => a.edition === 2026 && visible(a))
                  .map((a) => {
                    const film = data.films.find(
                      (item) => item.id === a.filmId && visible(item),
                    );
                    return (
                      <li className="panel" key={a.id}>
                        <strong>{t(a.title)}</strong>
                        <p>{a.recipient}</p>
                        {film && (
                          <a
                            className="text-link"
                            href={link(locale, "films", film.id)}
                          >
                            {film.title}
                          </a>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </section>
            <section id="archive-press">
              <h2>{t(experience.archiveKinds.press)}</h2>
              <Media data={data} locale={locale} t={t} />
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
      <Header locale={locale} page={page} id={id} missing={missing} />
      <main id="content" tabIndex={-1}>
        {page === "home" && !missing ? (
          <Home data={data} locale={locale} t={t} />
        ) : (
          <div className="shell page-body">
            {id && !missing && (
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
