/// <reference types="vite/client" />
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe2,
  MapPin,
  X,
} from "lucide-react";
import {
  copy,
  repository,
  type Festival,
  type Film,
  type Locale,
} from "./content";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource-variable/inter/wght.css";
import "./style.css";

const nav = ["films", "programme", "venues", "tickets", "afterparty"] as const;

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Italy Short Film Days Berlin">
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

function FilmRow({
  collection,
  films,
  locale,
  onSelect,
}: {
  collection: Festival["collections"][number];
  films: Film[];
  locale: Locale;
  onSelect: (film: Film) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const t = copy[locale];
  useEffect(() => {
    const row = track.current!;
    const update = () =>
      setEdges({
        start: row.scrollLeft < 2,
        end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    row.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", update);
    };
  }, []);
  const move = (direction: number) =>
    track.current?.scrollBy({
      left: direction * track.current.clientWidth * 0.7,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section className="collection" aria-labelledby={collection.id}>
      <div className="row-heading">
        <h2 id={collection.id}>{collection.title[locale]}</h2>
        <div className="row-controls">
          <button
            aria-label={t.previous}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label={t.next}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="film-track" ref={track}>
        {collection.filmIds.map((id) => {
          const film = films.find((item) => item.id === id);
          return (
            film && (
              <button
                className="film-card"
                key={id}
                onClick={() => onSelect(film)}
              >
                <div className="still">
                  <img src={film.stillUrl} alt="" loading="lazy" />
                  <span className="duration">{film.minutes} MIN</span>
                  <span className="hover-caption">{film.synopsis[locale]}</span>
                </div>
                <span className="film-title">
                  {film.title}
                  <ArrowUpRight size={16} />
                </span>
                <span className="film-meta">
                  {film.director} <span>·</span> {film.year}
                </span>
              </button>
            )
          );
        })}
      </div>
    </section>
  );
}

function Preview({
  film,
  locale,
  onClose,
}: {
  film: Film;
  locale: Locale;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const t = copy[locale];
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="preview-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <article>
        <button
          className="close"
          aria-label={t.close}
          onClick={() => dialog.current?.close()}
        >
          <X size={21} />
        </button>
        <img src={film.stillUrl} alt="" />
        <div className="preview-copy">
          <h2 id="preview-title">{film.title}</h2>
          <p className="film-meta">
            {t.directed} {film.director} · {film.year} · {film.minutes} min
          </p>
          <p>{film.synopsis[locale]}</p>
        </div>
      </article>
    </dialog>
  );
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem("festival-locale") === "it" ? "it" : "en";
    } catch {
      return "en";
    }
  });
  const [festival, setFestival] = useState<Festival>();
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<Film>();
  const t = copy[locale];
  useEffect(() => {
    repository
      .getFestival()
      .then(setFestival)
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("festival-locale", locale);
    } catch {
      /* Browsing without storage is supported. */
    }
  }, [locale]);
  return (
    <div id="top">
      <header className="header">
        <div className="shell header-inner">
          <Brand />
          <nav>
            {nav.map((id) => (
              <a key={id} href={`#${id}`}>
                {t[id]}
              </a>
            ))}
          </nav>
          <div className="languages">
            <Globe2 size={15} aria-hidden="true" />
            {(["en", "it"] as const).map((lang) => (
              <button
                key={lang}
                lang={lang}
                aria-label={lang === "en" ? "English" : "Italiano"}
                aria-pressed={locale === lang}
                onClick={() => setLocale(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="festival-title">
          <div className="shell hero-inner">
            <div className="eyebrow">
              <span />
              {t.date}
            </div>
            <h1 id="festival-title">
              ITALY SHORT
              <br />
              FILM DAYS
              <br />
              <strong>BERLIN 2027</strong>
            </h1>
            <p>{t.intro}</p>
            <div className="hero-actions">
              <a className="primary" href="#films">
                {t.explore}
                <ArrowDown size={17} />
              </a>
              <a className="secondary" href="#programme">
                {t.schedule}
                <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="location">
              <MapPin size={14} />
              {t.city}
            </div>
          </div>
        </section>
        <div id="films" className="shell lineup">
          <div className="eyebrow">
            <span />
            {t.lineup}
          </div>
          {failed && <p role="alert">{t.error}</p>}
          {festival?.collections.map((collection) => (
            <FilmRow
              key={collection.id}
              collection={collection}
              films={festival.films}
              locale={locale}
              onSelect={setSelected}
            />
          ))}
        </div>
        <div className="shell info">
          {festival?.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.title[locale]}</h2>
              <p>{section.body[locale]}</p>
            </section>
          ))}
        </div>
      </main>
      <footer className="shell footer">
        <Brand />
        <p>{t.mock}</p>
        <a href="#top">
          {t.top} <ArrowRight size={15} />
        </a>
      </footer>
      {selected && (
        <Preview
          film={selected}
          locale={locale}
          onClose={() => setSelected(undefined)}
        />
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
