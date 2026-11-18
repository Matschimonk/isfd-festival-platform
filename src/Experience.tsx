import { useId, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Aperture,
  Clapperboard,
  Play,
  Mic,
  Moon,
  Coffee,
  Headphones,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import {
  days,
  l,
  visible,
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
import { media, relatedMedia } from "./media-library";
import {
  MediaCredit,
  MediaGallery,
  MediaImage,
  MediaPlayer,
  mediaCopy,
} from "./Media";
import type { ArchiveKind } from "./media-types";
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

const watchPreview = l(
  "Watch preview",
  "Guarda l’anteprima",
  "Vorschau ansehen",
);
const closePreview = l(
  "Close preview",
  "Chiudi l’anteprima",
  "Vorschau schließen",
);

export function FilmCard({ film, locale }: { film: Film; locale: Locale }) {
  const id = useId();
  const [playing, setPlaying] = useState(false);
  const poster =
    relatedMedia("poster", "films", film.id)[0] ??
    relatedMedia("still", "films", film.id)[0];
  const preview = relatedMedia("preview", "films", film.id)[0];
  return (
    <article className="film-tile" data-frame={film.id.length % 4}>
      <a className="film-card-link" href={link(locale, "films", film.id)}>
        <div className="film-visual">
          {poster ? (
            <MediaImage asset={poster} locale={locale} />
          ) : (
            <span className="film-geometry" aria-hidden="true">
              <Clapperboard size={20} />
            </span>
          )}
          <span className="film-year">{film.edition}</span>
          <ArrowUpRight className="card-arrow" size={22} aria-hidden="true" />
        </div>
        <span className="film-name">
          <strong>{film.title}</strong>
          {film.directors?.length ? (
            <small>{film.directors.join(", ")}</small>
          ) : null}
        </span>
      </a>
      {poster && <MediaCredit asset={poster} locale={locale} />}
      {preview && (
        <div className="film-preview">
          <button
            type="button"
            aria-expanded={playing}
            aria-label={`${(playing ? closePreview : watchPreview)[locale]}: ${film.title}`}
            aria-controls={id}
            onClick={() => setPlaying(!playing)}
          >
            <Play size={16} aria-hidden="true" />
            {(playing ? closePreview : watchPreview)[locale]}
          </button>
          <div id={id} hidden={!playing}>
            {playing && (
              <>
                <MediaPlayer asset={preview} locale={locale} />
                <MediaCredit asset={preview} locale={locale} />
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function GenreExplorer({
  data,
  locale,
  compact = false,
}: Props & { compact?: boolean }) {
  const [selected, setSelected] = useState<FilmGenre[]>([]);
  const films = data.films.filter(visible);
  const featured = ["bellissima", "playing-god", "majoneze"].flatMap((id) =>
    films.filter((film) => film.id === id && film.edition === 2026),
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
          featured.length > 0 && (
            <div className="featured-film">
              <span className="eyebrow">{x.featured[locale]}</span>
              <div className="editorial-grid">
                {featured.map((film) => (
                  <FilmCard key={film.id} film={film} locale={locale} />
                ))}
              </div>
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
  const icons = [Aperture, Moon, Coffee];
  return (
    <EditorialSection title={x.social[locale]} id="social">
      <div className="editorial-grid">
        {socialHighlights.map(({ id, day, title, description }, i) => {
          const Icon = icons[i];
          return (
            <article className="story-card" key={id}>
              <div className={"story-art story-art-" + i} aria-hidden="true">
                <Icon size={45} />
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
          );
        })}
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
  const recordings = media.filter(
    (asset) => asset.role === "podcast" && asset.edition === 2027,
  );
  const interviews = media.filter((asset) => asset.role === "interview");
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
        <div className="podcast-feature">
          <div className="podcast-art" aria-hidden="true">
            <Mic size={50} />
          </div>
          <div>
            <h3>{x.talkTopics[3][locale]}</h3>
            {episodes.length ? (
              <ul>
                {episodes.map((episode) => (
                  <Episode key={episode.id} episode={episode} locale={locale} />
                ))}
              </ul>
            ) : (
              recordings.length === 0 && <p>{x.podcastPending[locale]}</p>
            )}
          </div>
        </div>
        {recordings.length > 0 && (
          <MediaGallery assets={recordings} locale={locale} data={data} />
        )}
        {interviews.length > 0 && (
          <>
            <h3>{mediaCopy.interviews[locale]}</h3>
            <MediaGallery assets={interviews} locale={locale} data={data} />
          </>
        )}
      </EditorialSection>
      <EditorialSection title={x.young[locale]} id="young-eyes">
        <div className="young-art" aria-hidden="true">
          <Sparkles size={54} />
        </div>
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
  href,
}: {
  person: Pick<Person, "id" | "name" | "role">;
  locale: Locale;
  href?: string;
}) {
  const portrait = relatedMedia("portrait", "guests", person.id)[0];
  const interviews = relatedMedia("interview", "guests", person.id);
  const initials = person.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <article className="editorial-profile">
      <div className="profile-art">
        {portrait ? (
          <MediaImage asset={portrait} locale={locale} />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="profile-copy">
        <h3>
          {href ? (
            <EditorialLink href={href}>{person.name}</EditorialLink>
          ) : (
            person.name
          )}
        </h3>
        {person.role && <span>{person.role[locale]}</span>}
        {portrait && <MediaCredit asset={portrait} locale={locale} />}
        {interviews.length > 0 && (
          <MediaGallery assets={interviews} locale={locale} />
        )}
      </div>
    </article>
  );
}

export function PeopleStories({ data, locale }: Props) {
  const highlights = data.awards.filter(
    (award) =>
      visible(award) &&
      award.edition === 2026 &&
      ["actor", "actress", "director"].includes(award.id),
  );
  const guests = data.people.filter(
    (person) => visible(person) && person.edition === 2026,
  );
  return (
    <EditorialSection
      title={
        l("People & Stories", "Persone e storie", "Menschen & Geschichten")[
          locale
        ]
      }
      id="people-stories"
    >
      <p className="eyebrow">{x.featured[locale]}</p>
      <div className="editorial-grid profile-grid">
        {highlights.map((award) => (
          <Profile
            key={award.id}
            person={{
              id: "award-" + award.id,
              name: award.recipient,
              role: award.title,
            }}
            locale={locale}
            href={link(locale, "archive") + "#archive-awards"}
          />
        ))}
        {guests.map((person) => (
          <Profile key={person.id} person={person} locale={locale} />
        ))}
      </div>
      <EditorialLink href={link(locale, "media")}>
        {pages.media[locale]}
      </EditorialLink>
    </EditorialSection>
  );
}

export function ArchiveFeature({ data, locale }: Props) {
  const assets = media.filter(
    (asset) => asset.edition === 2026 && asset.archive,
  );
  const chapters = Object.keys(x.archiveKinds) as ArchiveKind[];
  const highlights = [
    { kind: "screenings", href: "#archive-screenings", Icon: Clapperboard },
    { kind: "awards", href: "#archive-awards", Icon: Sparkles },
    { kind: "press", href: "#archive-press", Icon: Headphones },
  ] as const;
  const missing = chapters.filter(
    (kind) =>
      !highlights.some((item) => item.kind === kind) &&
      !assets.some((asset) => asset.archive === kind),
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
        <div className="editorial-grid archive-links">
          {highlights.map(({ kind, href, Icon }) => (
            <a key={kind} href={href} className="archive-chapter">
              <Icon size={28} aria-hidden="true" />
              <strong>{x.archiveKinds[kind][locale]}</strong>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
        {chapters.map((kind) => {
          const items = assets.filter((asset) => asset.archive === kind);
          return items.length ? (
            <section key={kind} className="archive-media-chapter">
              <h3>{x.archiveKinds[kind][locale]}</h3>
              <MediaGallery assets={items} locale={locale} data={data} />
            </section>
          ) : null;
        })}
        {missing.length > 0 && (
          <details className="archive-pending">
            <summary>
              {
                l(
                  "Media availability",
                  "Disponibilità dei contenuti",
                  "Verfügbarkeit der Medien",
                )[locale]
              }
            </summary>
            {assets.length === 0 && <p>{x.archivePending[locale]}</p>}
            <ul>
              {missing.map((kind) => (
                <li key={kind}>{x.archiveKinds[kind][locale]}</li>
              ))}
            </ul>
          </details>
        )}
      </EditorialSection>
    </>
  );
}

export function HomeFeatures({ data, locale }: Props) {
  const cards = [
    {
      title: x.talks,
      href: link(locale, "academy") + "#talks",
      Icon: Headphones,
      proposed: true,
    },
    {
      title: x.young,
      href: link(locale, "academy") + "#young-eyes",
      Icon: Sparkles,
      proposed: true,
    },
    {
      title: x.map,
      href: link(locale, "venues") + "#festival-map",
      Icon: MapPin,
    },
    {
      title: x.guests,
      href: link(locale, "festival") + "#guests",
      Icon: Users,
    },
  ];
  return (
    <>
      <WeekOverview locale={locale} />
      <GenreExplorer data={data} locale={locale} compact />
      <div className="editorial-grid home-features">
        {cards.map(({ title, href, Icon, proposed }) => (
          <a className="feature-card" href={href} key={href}>
            <span className="feature-art" aria-hidden="true">
              <Icon size={40} />
            </span>
            <span className="feature-text">
              <strong>{title[locale]}</strong>
              {proposed && <small>{x.proposed[locale]}</small>}
            </span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        ))}
      </div>
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
