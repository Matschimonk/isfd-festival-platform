import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { l, visible, type Festival, type Film, type Locale } from "./content";
import { EditorialPicture } from "./EditorialPicture";
import { link } from "./routes";

const copy = {
  title: l(
    "The 2026 short list",
    "Corti dall’archivio 2026",
    "Kurzfilme aus dem Archiv 2026",
  ),
  archive: l(
    "See the full film archive",
    "Tutti i film dell’archivio",
    "Zum vollständigen Filmarchiv",
  ),
  previous: l("Previous films", "Film precedenti", "Vorherige Filme"),
  next: l("Next films", "Film successivi", "Weitere Filme"),
  keyboard: l(
    "Use the left and right arrow keys to browse films.",
    "Usa le frecce sinistra e destra per sfogliare i film.",
    "Mit der linken und rechten Pfeiltaste durch die Filme blättern.",
  ),
  trailer: l("Trailer", "Trailer", "Trailer"),
};

const selections = [
  "bellissima",
  "playing-god",
  "majoneze",
  "ciao-varsavia",
  "marina",
  "maestrale",
  "fiji",
  "plutone",
  "marcello",
  "1799-diario",
];

function clearedTrailer(trailer: Film["approvedTrailer"]) {
  if (trailer?.rights !== "approved" || !trailer.credit.trim())
    return undefined;
  try {
    const url = new URL(trailer.url);
    return url.protocol === "https:" && !url.username && !url.password
      ? { url: url.href, credit: trailer.credit }
      : undefined;
  } catch {
    return undefined;
  }
}

export function FilmDiscovery({
  data,
  locale,
}: {
  data: Festival;
  locale: Locale;
}) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    left: number;
    moved: boolean;
  } | null>(null);
  const blockClick = useRef(false);
  const [ends, setEnds] = useState({ start: true, end: false });
  const verified = data.films.filter(
    (film) => visible(film) && film.edition === 2026 && film.source,
  );
  const films = selections.flatMap(
    (id) => verified.find((film) => film.id === id) ?? [],
  );

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    function measure() {
      if (!node) return;
      const start = node.scrollLeft < 2;
      const end = node.scrollLeft + node.clientWidth >= node.scrollWidth - 2;
      setEnds((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    }
    function wheel(event: WheelEvent) {
      // Native horizontal gestures remain untouched, as does the page’s vertical wheel.
      if (!node || !event.shiftKey || event.deltaX || !event.deltaY) return;
      const scale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? node.clientWidth
            : 1;
      const max = node.scrollWidth - node.clientWidth;
      const destination = Math.max(
        0,
        Math.min(max, node.scrollLeft + event.deltaY * scale),
      );
      if (Math.abs(destination - node.scrollLeft) < 1) return;
      event.preventDefault();
      node.scrollLeft = destination;
    }
    const resize = new ResizeObserver(measure);
    resize.observe(node);
    node.addEventListener("scroll", measure, { passive: true });
    node.addEventListener("wheel", wheel, { passive: false });
    measure();
    return () => {
      resize.disconnect();
      node.removeEventListener("scroll", measure);
      node.removeEventListener("wheel", wheel);
    };
  }, [films.length]);

  function slide(direction: -1 | 1 | "start" | "end") {
    const node = track.current;
    if (!node) return;
    const first =
      (node.firstElementChild as HTMLElement | null)?.offsetLeft ?? 0;
    const positions = [...node.children].map(
      (card) => (card as HTMLElement).offsetLeft - first,
    );
    const max = node.scrollWidth - node.clientWidth;
    const left =
      direction === "start"
        ? 0
        : direction === "end"
          ? max
          : direction === 1
            ? (positions.find((position) => position > node.scrollLeft + 2) ??
              max)
            : (positions
                .reverse()
                .find((position) => position < node.scrollLeft - 2) ?? 0);
    node.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function stopDrag(node: HTMLUListElement, pointerId: number) {
    if (drag.current?.pointerId !== pointerId) return;
    blockClick.current = drag.current.moved;
    drag.current = null;
    node.removeAttribute("data-dragging");
    if (node.hasPointerCapture(pointerId))
      node.releasePointerCapture(pointerId);
  }

  if (!films.length) return null;
  return (
    <section
      className="cinema-rail"
      id="film-discovery"
      aria-labelledby={`${id}-title`}
    >
      <div className="cinema-rail-header">
        <h2 id={`${id}-title`}>{copy.title[locale]}</h2>
        <div className="cinema-rail-controls cinema-interactive">
          <button
            type="button"
            aria-label={copy.previous[locale]}
            aria-controls={id}
            aria-disabled={ends.start}
            onClick={() => !ends.start && slide(-1)}
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={copy.next[locale]}
            aria-controls={id}
            aria-disabled={ends.end}
            onClick={() => !ends.end && slide(1)}
          >
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul
        ref={track}
        id={id}
        className="cinema-rail-track"
        aria-labelledby={`${id}-title`}
        aria-description={copy.keyboard[locale]}
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
          )
            return;
          const directions = {
            ArrowLeft: -1,
            ArrowRight: 1,
            Home: "start",
            End: "end",
          } as const;
          const direction = directions[event.key as keyof typeof directions];
          if (direction === undefined) return;
          event.preventDefault();
          slide(direction);
        }}
        onPointerDown={(event) => {
          if (
            event.pointerType !== "mouse" ||
            event.button !== 0 ||
            !event.isPrimary
          )
            return;
          blockClick.current = false;
          drag.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            left: event.currentTarget.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || state.pointerId !== event.pointerId) return;
          if (!event.buttons)
            return stopDrag(event.currentTarget, event.pointerId);
          const delta = event.clientX - state.x;
          if (!state.moved && Math.abs(delta) < 7) return;
          if (!state.moved) {
            state.moved = true;
            event.currentTarget.dataset.dragging = "";
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          event.currentTarget.scrollLeft = state.left - delta;
        }}
        onPointerUp={(event) => stopDrag(event.currentTarget, event.pointerId)}
        onPointerCancel={(event) =>
          stopDrag(event.currentTarget, event.pointerId)
        }
        onLostPointerCapture={(event) =>
          stopDrag(event.currentTarget, event.pointerId)
        }
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (!blockClick.current || !event.detail) return;
          blockClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {films.map((film, index) => {
          const poster =
            film.discoveryPoster?.rights === "approved"
              ? film.discoveryPoster
              : undefined;
          const trailer = clearedTrailer(film.approvedTrailer);
          const award = data.awards.find(
            (award) =>
              visible(award) &&
              award.source &&
              award.edition === film.edition &&
              award.filmId === film.id,
          );
          const runtime = film.minutes ? `${film.minutes} min` : undefined;
          return (
            <li
              key={film.id}
              className="cinema-rail-item"
              data-tone={index % 4}
            >
              <a
                className="cinema-film-link"
                href={link(locale, "films", film.id)}
                draggable={false}
              >
                <span className="cinema-film-frame">
                  {poster ? (
                    <EditorialPicture
                      image={poster}
                      locale={locale}
                      sizes="(max-width: 560px) 68vw, 264px"
                    />
                  ) : (
                    <span className="cinema-film-graphic" aria-hidden="true">
                      <span>{film.title}</span>
                    </span>
                  )}
                  <span className="cinema-film-reveal" aria-hidden="true">
                    {[runtime, award?.title[locale] ?? film.edition]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="cinema-film-title">
                  <strong>{film.title}</strong>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
                <span className="cinema-film-byline">
                  {[film.directors?.join(", "), runtime]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {poster && (
                  <small className="cinema-credit">{poster.credit}</small>
                )}
              </a>
              {trailer && (
                <>
                  <a
                    className="cinema-trailer-link"
                    href={trailer.url}
                    aria-label={`${copy.trailer[locale]} · ${film.title}`}
                    draggable={false}
                  >
                    <Play size={15} aria-hidden="true" />
                    {copy.trailer[locale]}
                  </a>
                  <small className="cinema-credit">{trailer.credit}</small>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <a
        className="editorial-link"
        href={`${link(locale, "archive")}#archive-films`}
      >
        {copy.archive[locale]} <ArrowUpRight size={17} aria-hidden="true" />
      </a>
    </section>
  );
}
