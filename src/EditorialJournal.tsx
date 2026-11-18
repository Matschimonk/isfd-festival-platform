import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  isConfirmedEvent,
  l,
  visible,
  type EditorialImage,
  type Festival,
  type JournalCategory,
  type JournalStory,
  type Locale,
} from "./content";
import { pages } from "./copy";
import { EditorialPicture } from "./EditorialPicture";
import { journalCategories, journalCopy as copy } from "./journal-content";
import { link } from "./routes";

const artwork: EditorialImage = {
  src: "/images/hero.webp",
  alt: l(
    "Red-and-black graphic with a silhouetted figure",
    "Grafica rossa e nera con una figura in controluce",
    "Rot-schwarzes Motiv mit einer Silhouette",
  ),
  credit: "Italy Short Film Days Berlin · Director’s Preview",
  rights: "approved",
  width: 2100,
  height: 700,
  variants: [
    { src: "/images/editorial/isfd-artwork-768.webp", width: 768 },
    { src: "/images/editorial/isfd-artwork-1280.webp", width: 1280 },
    { src: "/images/hero.webp", width: 2100 },
  ],
};

function Cover({
  story,
  locale,
  feature = false,
  article = false,
}: {
  story: JournalStory;
  locale: Locale;
  feature?: boolean;
  article?: boolean;
}) {
  const cleared = story.hero?.rights === "approved" ? story.hero : undefined;
  const image = cleared ?? (feature || article ? artwork : undefined);
  return (
    <figure className="journal-cover">
      <div className="journal-image" data-category={story.category}>
        {image ? (
          <EditorialPicture
            image={image}
            locale={locale}
            eager={article}
            sizes={
              article
                ? "(max-width: 720px) 94vw, 1100px"
                : feature
                  ? "(max-width: 720px) 94vw, 670px"
                  : "(max-width: 720px) 43vw, 420px"
            }
          />
        ) : (
          <div className="journal-graphic" aria-hidden="true">
            <span />
          </div>
        )}
      </div>
      {image && (
        <figcaption>
          {cleared ? cleared.credit : copy.artwork[locale]}
        </figcaption>
      )}
    </figure>
  );
}

function StoryCard({
  story,
  locale,
  feature = false,
  topLevel = false,
}: {
  story: JournalStory;
  locale: Locale;
  feature?: boolean;
  topLevel?: boolean;
}) {
  const Heading = topLevel ? "h2" : "h3";
  return (
    <article
      className={feature ? "journal-card journal-feature" : "journal-card"}
    >
      <Cover story={story} locale={locale} feature={feature} />
      <div className="journal-card-copy">
        <p className="journal-rubric">
          {journalCategories[story.category][locale]}
          {story.demo && <span>{copy.demo[locale]}</span>}
        </p>
        <Heading>
          <a href={link(locale, "journal", story.id)}>{story.title[locale]}</a>
        </Heading>
        <p>{story.subtitle[locale]}</p>
        {feature && (
          <a
            className="editorial-link"
            href={link(locale, "journal", story.id)}
            aria-label={`${copy.read[locale]} · ${story.title[locale]}`}
          >
            {copy.read[locale]} <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

export function JournalTeaser({
  data,
  locale,
}: {
  data: Festival;
  locale: Locale;
}) {
  const stories = (data.journal ?? []).filter(visible);
  const featured = stories.find((story) => story.featured) ?? stories[0];
  if (!featured) return null;
  return (
    <section className="journal-home" aria-labelledby="journal-home-title">
      <div className="cinema-rail-header">
        <h2 id="journal-home-title">{pages.journal[locale]}</h2>
        <a className="editorial-link" href={link(locale, "journal")}>
          {copy.open[locale]} <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <StoryCard story={featured} locale={locale} feature />
    </section>
  );
}

export function JournalLanding({
  data,
  locale,
}: {
  data: Festival;
  locale: Locale;
}) {
  const [category, setCategory] = useState<JournalCategory | "">("");
  const stories = (data.journal ?? []).filter(visible);
  const feature = stories.find((story) => story.featured) ?? stories[0];
  const cards = category
    ? stories.filter((story) => story.category === category)
    : stories.filter((story) => story !== feature);
  const heading = category
    ? journalCategories[category][locale]
    : copy.stories[locale];
  return (
    <section className="journal-landing" aria-label={pages.journal[locale]}>
      <p className="journal-deck">{copy.intro[locale]}</p>
      <div
        className="journal-filters cinema-interactive"
        role="group"
        aria-label={pages.journal[locale]}
      >
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => setCategory("")}
        >
          {copy.all[locale]}
        </button>
        {(Object.keys(journalCategories) as JournalCategory[])
          .filter((key) => stories.some((story) => story.category === key))
          .map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {journalCategories[key][locale]}
            </button>
          ))}
      </div>
      {feature && !category && (
        <StoryCard story={feature} locale={locale} feature topLevel />
      )}
      {cards.length > 0 && (
        <section
          aria-labelledby="journal-selected"
          className="journal-selected"
        >
          <h2 id="journal-selected" aria-live="polite">
            {heading}
          </h2>
          <div className="journal-grid">
            {cards.map((story) => (
              <StoryCard key={story.id} story={story} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

export function JournalArticle({
  data,
  locale,
  story,
}: {
  data: Festival;
  locale: Locale;
  story: JournalStory;
}) {
  const films = data.films.filter(visible);
  const film = films.find((item) => item.id === story.filmId);
  const event = data.events.find(
    (item) =>
      visible(item) && item.id === story.eventId && isConfirmedEvent(item),
  );
  const stories = (data.journal ?? []).filter(visible);
  const index = stories.findIndex((item) => item.id === story.id);
  const previous = stories[index - 1];
  const next = stories[index + 1];
  const related = story.reading;
  const reading =
    related &&
    (related.page === "archive" ||
      data.articles.some((item) => visible(item) && item.id === related.id))
      ? `${link(locale, related.page, related.id)}${related.anchor ? `#${related.anchor}` : ""}`
      : undefined;
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${story.date}T00:00:00Z`));
  const credit = (label: string, value: string) => `${label} · ${value}`;
  return (
    <article className="journal-article">
      <header className="journal-article-header">
        <p className="journal-rubric">
          {journalCategories[story.category][locale]}{" "}
          {story.demo && <span>{copy.demo[locale]}</span>}
        </p>
        <h1>{story.title[locale]}</h1>
        <p className="journal-deck">{story.subtitle[locale]}</p>
        <p className="journal-byline">
          <span>
            {copy.by[locale]} {story.author[locale]}
          </span>
          <span>
            {story.demo && `${copy.previewDate[locale]} · `}
            <time dateTime={story.date}>{date}</time>
          </span>
        </p>
      </header>
      <Cover story={story} locale={locale} article />
      <div className="journal-reading">
        <div className="journal-prose">
          {story.demo && (
            <p className="journal-demo-note">{copy.demoNote[locale]}</p>
          )}
          {story.body.map((paragraph, i) => (
            <div key={i}>
              <p>{paragraph[locale]}</p>
              {i === 0 && story.pullQuote && (
                <blockquote>{story.pullQuote[locale]}</blockquote>
              )}
            </div>
          ))}
          {reading && related && (
            <p>
              <a className="editorial-link" href={reading}>
                {related.label[locale]}{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </p>
          )}
          {event && (
            <p>
              <a
                className="editorial-link"
                href={link(locale, "programme", event.id)}
              >
                {credit(copy.event[locale], event.title[locale])}{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </p>
          )}
        </div>
        {film && (
          <aside
            className="journal-film-note"
            aria-labelledby="journal-film-note"
          >
            <h2 id="journal-film-note">{copy.film[locale]}</h2>
            <a href={link(locale, "films", film.id)}>
              {film.title} <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            {film.directors?.length && <p>{film.directors.join(", ")}</p>}
            <p>
              {[
                film.minutes && `${film.minutes} min`,
                `${pages.archive[locale]} ${film.edition}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </aside>
        )}
      </div>
      <nav className="journal-pagination" aria-label={copy.related[locale]}>
        {previous && (
          <a href={link(locale, "journal", previous.id)}>
            <span>{copy.previous[locale]}</span>
            <strong>{previous.title[locale]}</strong>
          </a>
        )}
        {next && (
          <a href={link(locale, "journal", next.id)}>
            <span>{copy.next[locale]}</span>
            <strong>{next.title[locale]}</strong>
          </a>
        )}
      </nav>
    </article>
  );
}
