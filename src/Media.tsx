import { useId, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, X } from "lucide-react";
import { l, visible, type Festival, type Locale } from "./content";
import type { MediaAsset } from "./media-types";
import { link } from "./routes";

export const mediaCopy = {
  open: l("View full size", "Vedi a schermo intero", "Großansicht öffnen"),
  close: l("Close image", "Chiudi l’immagine", "Bild schließen"),
  source: l("Source", "Fonte", "Quelle"),
  transcript: l("Transcript", "Trascrizione", "Transkript"),
  film: l("Film media", "Foto e video del film", "Filmbilder und Videos"),
  interviews: l(
    "Recorded interviews",
    "Interviste registrate",
    "Interviewaufzeichnungen",
  ),
  recordings: l(
    "Event media",
    "Foto e video dell’evento",
    "Medien zur Veranstaltung",
  ),
};

export function MediaImage({
  asset,
  locale,
  sizes = "(max-width: 600px) 100vw, 33vw",
  full = false,
}: {
  asset: MediaAsset;
  locale: Locale;
  sizes?: string;
  full?: boolean;
}) {
  const srcSet =
    asset.variants?.length && asset.width
      ? [...asset.variants, { src: asset.src, width: asset.width }]
          .sort((a, b) => a.width - b.width)
          .map((item) => `${item.src} ${item.width}w`)
          .join(", ")
      : undefined;
  return (
    <img
      src={full ? asset.src : (asset.thumbnail ?? asset.src)}
      srcSet={!full && srcSet ? srcSet : undefined}
      sizes={!full && srcSet ? sizes : undefined}
      alt={asset.alt?.[locale]}
      width={asset.width}
      height={asset.height}
      loading={full ? undefined : "lazy"}
      decoding="async"
    />
  );
}

export function MediaCredit({
  asset,
  locale,
}: {
  asset: MediaAsset;
  locale: Locale;
}) {
  return (
    <small className="media-credit">
      {asset.credit} · © {asset.copyrightOwner} ·{" "}
      <a href={asset.source}>{mediaCopy.source[locale]}</a>
    </small>
  );
}

export function MediaPlayer({
  asset,
  locale,
}: {
  asset: MediaAsset;
  locale: Locale;
}) {
  return (
    <>
      {asset.type === "audio" ? (
        <audio
          src={asset.src}
          controls
          preload="none"
          aria-label={asset.title[locale]}
        />
      ) : (
        <video
          src={asset.src}
          poster={asset.thumbnail}
          controls
          playsInline
          preload="none"
          crossOrigin={asset.captions?.length ? "anonymous" : undefined}
          aria-label={asset.title[locale]}
        >
          {asset.captions?.map((track) => (
            <track
              key={track.locale}
              kind="captions"
              src={track.src}
              srcLang={track.locale}
              label={track.label}
              default={track.locale === locale}
            />
          ))}
        </video>
      )}
      {asset.transcript && (
        <details className="media-transcript">
          <summary>{mediaCopy.transcript[locale]}</summary>
          <p>{asset.transcript[locale]}</p>
        </details>
      )}
    </>
  );
}

function ImageViewer({ asset, locale }: { asset: MediaAsset; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const label = useId();
  return (
    <>
      <div className="media-image-view">
        <a
          href={asset.src}
          ref={trigger}
          onClick={(event) => {
            if (
              !dialog.current?.showModal ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            setOpen(true);
            dialog.current.showModal();
            dialog.current.querySelector<HTMLButtonElement>("button")?.focus();
          }}
          aria-label={`${mediaCopy.open[locale]}: ${asset.title[locale]}`}
        >
          <MediaImage asset={asset} locale={locale} />
          <Maximize2 size={20} aria-hidden="true" />
        </a>
      </div>
      <dialog
        className="media-lightbox"
        ref={dialog}
        aria-labelledby={label}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          type="button"
          className="close"
          aria-label={mediaCopy.close[locale]}
          onClick={() => dialog.current?.close()}
        >
          <X size={22} aria-hidden="true" />
        </button>
        {/* The full-size file is loaded only when the viewer opens. The image link remains usable without JavaScript. */}
        {open && <MediaImage asset={asset} locale={locale} full />}
        <p id={label}>{asset.title[locale]}</p>
        <MediaCredit asset={asset} locale={locale} />
      </dialog>
    </>
  );
}

export function MediaGallery({
  assets,
  locale,
  data,
}: {
  assets: MediaAsset[];
  locale: Locale;
  data?: Festival;
}) {
  if (assets.length === 0) return null;
  return (
    <div className="editorial-grid archive-assets">
      {assets.map((asset) => (
        <figure className="archive-asset media-figure" key={asset.id}>
          {asset.type === "image" ? (
            <ImageViewer asset={asset} locale={locale} />
          ) : (
            <MediaPlayer asset={asset} locale={locale} />
          )}
          <figcaption>
            <strong>{asset.title[locale]}</strong>
            <p>{asset.description[locale]}</p>
            <MediaCredit asset={asset} locale={locale} />
          </figcaption>
          {data?.films
            .filter(
              (film) => visible(film) && asset.related.films?.includes(film.id),
            )
            .map((film) => (
              <a
                key={film.id}
                className="editorial-link"
                href={link(locale, "films", film.id)}
              >
                {film.title}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            ))}
        </figure>
      ))}
    </div>
  );
}
