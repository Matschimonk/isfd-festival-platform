import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Aperture,
  Clapperboard,
  Headphones,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import {
  days,
  visible,
  type ArchiveMedia,
  type Festival,
  type Film,
  type FilmGenre,
  type Locale,
  type Person,
  type PodcastEpisode,
} from "./content";
import {
  experience as x,
  festivalWeek,
  genres,
  socialHighlights,
} from "./experience-content";
import { pages, ui } from "./copy";
import { link } from "./routes";

type Props = { data: Festival; locale: Locale };
type Titled = { title: string; children: ReactNode; id?: string };

function EditorialSection({ title, children, id }: Titled) {
  return (
    <section className="editorial-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function EditorialLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="editorial-link" href={href}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export function WeekOverview({ locale }: { locale: Locale }) {
  return (
    <EditorialSection title={ui.week[locale]} id="week">
      <p>{ui.outline[locale]}</p>
      <div className="editorial-week">
        {festivalWeek.map(({ title, line }, i) => (
          <details key={i} name="festival-week" open={i === 0}>
            <summary>
              <span className="eyebrow">{days[i][locale]}</span>
              <strong>{title[locale]}</strong>
              <span className="week-indicator" aria-hidden="true" />
            </summary>
            <div className="week-story">
              <p>{line[locale]}</p>
              <EditorialLink href={link(locale, "programme") + "#day-" + i}>
                {x.exploreDay[locale]}
              </EditorialLink>
            </div>
          </details>
        ))}
      </div>
    </EditorialSection>
  );
}

function FilmCard({ film, locale }: { film: Film; locale: Locale }) {
  return (
    <a className="editorial-film" href={link(locale, "films", film.id)}>
      <Clapperboard size={19} aria-hidden="true" />
      <strong>{film.title}</strong>
      {film.directors?.length ? <span>{film.directors.join(", ")}</span> : null}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export function GenreExplorer({
  data,
  locale,
  compact = false,
}: Props & { compact?: boolean }) {
  const [selected, setSelected] = useState<FilmGenre[]>([]);
  const films = data.films.filter(visible);
  const featured = films.find(
    (film) => film.id === "bellissima" && film.edition === 2026,
  );
  const matches = films.filter((film) =>
    film.verifiedGenres?.some((genre) => selected.includes(genre)),
  );
  return (
    <EditorialSection title={x.discover[locale]} id="genres">
      <p>{x.genreHelp[locale]}</p>
      <div
        className="editorial-filters"
        role="group"
        aria-label={x.discover[locale]}
      >
        {(Object.keys(genres) as FilmGenre[]).map((genre) => (
          <button
            type="button"
            key={genre}
            aria-pressed={selected.includes(genre)}
            onClick={() =>
              setSelected((current) =>
                current.includes(genre)
                  ? current.filter((item) => item !== genre)
                  : [...current, genre],
              )
            }
          >
            {genres[genre][locale]}
          </button>
        ))}
        {selected.length > 0 && (
          <button type="button" onClick={() => setSelected([])}>
            {x.clear[locale]}
          </button>
        )}
      </div>
      <div aria-live="polite">
        {selected.length ? (
          matches.length ? (
            <div className="editorial-grid">
              {matches.map((film) => (
                <FilmCard film={film} locale={locale} key={film.id} />
              ))}
            </div>
          ) : (
            <p>{x.genreEmpty[locale]}</p>
          )
        ) : (
          featured && (
            <div className="featured-film">
              <span className="eyebrow">{x.featured[locale]}</span>
              <FilmCard film={featured} locale={locale} />
            </div>
          )
        )}
      </div>
      {compact && (
        <EditorialLink href={link(locale, "films")}>
          {pages.films[locale]}
        </EditorialLink>
      )}
    </EditorialSection>
  );
}

export function SocialProgramme({ locale }: { locale: Locale }) {
  return (
    <EditorialSection title={x.social[locale]} id="social">
      <div className="editorial-grid">
        {socialHighlights.map(({ id, day, title, description }, i) => (
          <article className="story-card" key={id}>
            <div className={"story-art story-art-" + i} aria-hidden="true">
              <Aperture size={38} />
            </div>
            <div className="story-copy">
              <p className="eyebrow">{days[day][locale]}</p>
              <h3>{title[locale]}</h3>
              <p>{description[locale]}</p>
              <small>{x.proposed[locale]}</small>
              <EditorialLink href={link(locale, "programme", id)}>
                {pages.programme[locale]}
              </EditorialLink>
            </div>
          </article>
        ))}
      </div>
    </EditorialSection>
  );
}

function Episode({
  episode,
  locale,
}: {
  episode: PodcastEpisode;
  locale: Locale;
}) {
  return (
    <li>
      {episode.url ? (
        <EditorialLink href={episode.url}>
          {episode.title[locale]}
        </EditorialLink>
      ) : (
        episode.title[locale]
      )}
    </li>
  );
}

export function TalksAndSchools({ data, locale }: Props) {
  const episodes = data.podcasts.filter(
    (episode) => visible(episode) && episode.edition === 2027,
  );
  return (
    <>
      <EditorialSection title={x.talks[locale]} id="talks">
        <p className="eyebrow">{x.proposed[locale]}</p>
        <p>{x.talkIntro[locale]}</p>
        <ul className="editorial-topics">
          {x.talkTopics.map((topic) => (
            <li key={topic.en}>{topic[locale]}</li>
          ))}
        </ul>
        {episodes.length > 0 ? (
          <ul>
            {episodes.map((episode) => (
              <Episode key={episode.id} episode={episode} locale={locale} />
            ))}
          </ul>
        ) : (
          <p>{x.podcastPending[locale]}</p>
        )}
      </EditorialSection>
      <EditorialSection title={x.young[locale]} id="young-eyes">
        <p className="eyebrow">{x.proposed[locale]}</p>
        <p>{x.youngIntro[locale]}</p>
        <ul className="editorial-topics">
          {x.youngTopics.map((topic) => (
            <li key={topic.en}>{topic[locale]}</li>
          ))}
        </ul>
        <article className="panel">
          <h3>{x.registration[locale]}</h3>
          <p>{x.registrationPending[locale]}</p>
        </article>
      </EditorialSection>
    </>
  );
}

export function Profile({
  person,
  locale,
}: {
  person: Person;
  locale: Locale;
}) {
  return (
    <article className="editorial-profile">
      <Users size={19} aria-hidden="true" />
      <strong>{person.name}</strong>
      {person.role && <span>{person.role[locale]}</span>}
    </article>
  );
}

function ArchiveAsset({
  asset,
  locale,
  data,
}: {
  asset: ArchiveMedia;
  locale: Locale;
  data: Festival;
}) {
  const related = data.films.filter(
    (film) => visible(film) && asset.filmIds?.includes(film.id),
  );
  return (
    <figure className="archive-asset">
      {asset.format === "image" ? (
        <img src={asset.url} loading="lazy" alt={asset.caption[locale]} />
      ) : asset.format === "video" ? (
        <video
          src={asset.url}
          controls
          preload="none"
          aria-label={asset.caption[locale]}
        />
      ) : (
        <EditorialLink href={asset.url}>{asset.caption[locale]}</EditorialLink>
      )}
      <figcaption>
        {asset.format !== "link" && asset.caption[locale]}{" "}
        <span>{asset.credit}</span>
        {asset.language && (
          <span lang={asset.language}> · {asset.language.toUpperCase()}</span>
        )}
      </figcaption>
      {related.map((film) => (
        <EditorialLink key={film.id} href={link(locale, "films", film.id)}>
          {film.title}
        </EditorialLink>
      ))}
    </figure>
  );
}

export function ArchiveFeature({ data, locale }: Props) {
  const assets = (data.archiveMedia ?? []).filter(
    (asset) =>
      visible(asset) && asset.year === 2026 && asset.rights === "approved",
  );
  return (
    <>
      <div className="retrospective-intro">
        <div className="archive-frame" aria-hidden="true">
          <span>2026</span>
        </div>
        <p>{x.archiveIntro[locale]}</p>
      </div>
      <EditorialSection title={x.archiveMedia[locale]} id="visual-archive">
        {assets.length === 0 && <p>{x.archivePending[locale]}</p>}
        <div className="editorial-grid archive-slots">
          {(Object.keys(x.archiveKinds) as ArchiveMedia["kind"][]).map(
            (kind) => {
              const items = assets.filter((asset) => asset.kind === kind);
              const quickLink =
                kind === "screenings"
                  ? "#archive-screenings"
                  : kind === "awards"
                    ? "#archive-awards"
                    : kind === "press"
                      ? "#archive-press"
                      : undefined;
              return (
                <article className="panel" key={kind}>
                  <h3>{x.archiveKinds[kind][locale]}</h3>
                  {items.map((asset) => (
                    <ArchiveAsset
                      key={asset.id}
                      asset={asset}
                      data={data}
                      locale={locale}
                    />
                  ))}
                  {quickLink ? (
                    <EditorialLink href={quickLink}>
                      {x.archiveKinds[kind][locale]}
                    </EditorialLink>
                  ) : (
                    items.length === 0 && <small>{ui.dates[locale]}</small>
                  )}
                </article>
              );
            },
          )}
        </div>
      </EditorialSection>
    </>
  );
}

export function HomeFeatures({ data, locale }: Props) {
  const cards = [
    {
      title: x.talks,
      text: x.talkIntro,
      href: link(locale, "academy") + "#talks",
      Icon: Headphones,
      proposed: true,
    },
    {
      title: x.young,
      text: x.youngIntro,
      href: link(locale, "academy") + "#young-eyes",
      Icon: Sparkles,
      proposed: true,
    },
    {
      title: x.map,
      text: x.mapIntro,
      href: link(locale, "venues") + "#festival-map",
      Icon: MapPin,
    },
    {
      title: x.guests,
      text: x.guestPending,
      href: link(locale, "festival") + "#guests",
      Icon: Users,
    },
  ];
  return (
    <>
      <WeekOverview locale={locale} />
      <div className="editorial-grid home-features">
        {cards.map(({ title, text, href, Icon, proposed }) => (
          <article className="feature-card" key={href}>
            <Icon size={23} aria-hidden="true" />
            <h2>{title[locale]}</h2>
            {proposed && <small>{x.proposed[locale]}</small>}
            <p>{text[locale]}</p>
            <EditorialLink href={href}>{title[locale]}</EditorialLink>
          </article>
        ))}
      </div>
      <GenreExplorer data={data} locale={locale} compact />
      <SocialProgramme locale={locale} />
      <section className="archive-promo">
        <div className="archive-frame" aria-hidden="true">
          <span>2026</span>
        </div>
        <div>
          <h2>{x.archiveTitle[locale]}</h2>
          <p>{x.archiveIntro[locale]}</p>
          <EditorialLink href={link(locale, "archive") + "#visual-archive"}>
            {x.archiveMedia[locale]}
          </EditorialLink>
        </div>
      </section>
    </>
  );
}
