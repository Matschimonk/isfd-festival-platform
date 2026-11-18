import { useState, type FormEvent } from "react";
import { ArrowUpRight, Aperture, Play, QrCode } from "lucide-react";
import { l, visible, type Festival, type Locale } from "./content";
import { link } from "./routes";
import { ui } from "./copy";
import { FilmCard } from "./Experience";

const copy = {
  preview: l(
    "Director’s preview",
    "Anteprima per la direzione",
    "Vorschau für die Festivalleitung",
  ),
  trailer: l(
    "Official festival trailer · 2026",
    "Trailer ufficiale del festival · 2026",
    "Offizieller Festivaltrailer · 2026",
  ),
  play: l(
    "Load YouTube player",
    "Carica il lettore YouTube",
    "YouTube-Player laden",
  ),
  youtube: l("Watch on YouTube", "Guarda su YouTube", "Auf YouTube ansehen"),
  privacyTrailer: l(
    "Loading the player connects to YouTube.",
    "Il caricamento del lettore si collega a YouTube.",
    "Beim Laden des Players wird eine Verbindung zu YouTube hergestellt.",
  ),
  trailerFallback: l(
    "If the player is unavailable here, open the trailer on YouTube.",
    "Se il lettore non è disponibile qui, apri il trailer su YouTube.",
    "Falls der Player hier nicht verfügbar ist, öffne den Trailer auf YouTube.",
  ),
  partners: l(
    "Put short cinema in focus.",
    "Metti a fuoco il cinema breve.",
    "Kurzfilm im Fokus.",
  ),
  partnerIntro: l(
    "Connect Italian filmmakers with Berlin’s independent cinema audiences, schools and creative community.",
    "Metti in contatto chi fa cinema in Italia con il pubblico dei cinema indipendenti, le scuole e la comunità creativa di Berlino.",
    "Vernetze italienische Filmschaffende mit Berlins unabhängigem Kinopublikum, Schulen und Kreativszene.",
  ),
  formats: [
    l(
      "Screening support",
      "Sostegno alle proiezioni",
      "Unterstützung von Vorführungen",
    ),
    l("Education & access", "Formazione e accesso", "Filmbildung und Zugang"),
    l(
      "Editorial & hospitality",
      "Media e ospitalità",
      "Redaktion und Gastfreundschaft",
    ),
  ],
  historic: l(
    "2026 festival partners",
    "Partner del festival 2026",
    "Festivalpartner 2026",
  ),
  sponsor: l(
    "2026 main sponsor",
    "Sponsor principale 2026",
    "Hauptsponsor 2026",
  ),
  deck: l(
    "Partnership presentation",
    "Presentazione per i partner",
    "Partnerpräsentation",
  ),
  deckPending: l(
    "The festival team has yet to supply the presentation PDF.",
    "Il team del festival deve ancora fornire la presentazione in PDF.",
    "Das Festivalteam hat die Präsentation als PDF noch nicht bereitgestellt.",
  ),
  contact: l("Contact the team", "Contatta il team", "Kontakt zum Team"),
  press: l("Press archive", "Archivio stampa", "Pressearchiv"),
  contactIntro: l(
    "For editorial or partnership enquiries, use the published festival contact below.",
    "Per richieste editoriali o collaborazioni, usa il contatto pubblico del festival.",
    "Für redaktionelle Anfragen oder Partnerschaften steht der veröffentlichte Festivalkontakt zur Verfügung.",
  ),
  contactSource: l(
    "Published festival contact",
    "Contatto pubblico del festival",
    "Veröffentlichter Festivalkontakt",
  ),
  newsTitle: l(
    "A seat in the front row.",
    "Un posto in prima fila.",
    "Ein Platz in der ersten Reihe.",
  ),
  newsDemo: l(
    "Signup preview. Use a test address. Nothing is sent or stored.",
    "Anteprima dell’iscrizione. Usa un indirizzo di prova. Nessun dato viene inviato o salvato.",
    "Anmeldevorschau. Bitte eine Testadresse verwenden. Es werden keine Daten gesendet oder gespeichert.",
  ),
  email: l("Email address", "Indirizzo email", "E-Mail-Adresse"),
  consent: l(
    "I would like festival updates by email.",
    "Vorrei ricevere aggiornamenti sul festival via email.",
    "Ich möchte Festival-Updates per E-Mail erhalten.",
  ),
  privacy: l(
    "Privacy information",
    "Informazioni sulla privacy",
    "Datenschutzinformationen",
  ),
  test: l("Test signup", "Prova l’iscrizione", "Anmeldung testen"),
  receipt: l(
    "Validation passed. This preview did not submit or save the address.",
    "Controllo superato. L’indirizzo non è stato inviato né salvato.",
    "Prüfung bestanden. Die Adresse wurde weder gesendet noch gespeichert.",
  ),
  ticketDemo: l(
    "Ticket demo · no payment",
    "Demo biglietti · nessun pagamento",
    "Ticket-Demo · keine Zahlung",
  ),
  ticketPitch: l(
    "Find your way into the programme.",
    "Trova il tuo posto nel programma.",
    "Finde deinen Platz im Programm.",
  ),
  ticketPending: l(
    "Proposed categories. Sales, prices and availability are unconfirmed.",
    "Categorie proposte. Vendita, prezzi e disponibilità non sono confermati.",
    "Vorgeschlagene Kategorien. Verkauf, Preise und Verfügbarkeit stehen noch nicht fest.",
  ),
  qr: l(
    "Show demo QR code",
    "Mostra il QR dimostrativo",
    "Demo-QR-Code anzeigen",
  ),
  loading: l(
    "Generating code…",
    "Generazione del codice…",
    "Code wird erstellt…",
  ),
  qrFailed: l(
    "The QR code could not load. Use the demo link.",
    "Il codice QR non è disponibile. Usa il link della demo.",
    "Der QR-Code konnte nicht geladen werden. Nutze den Demo-Link.",
  ),
  demoNote: l(
    "You’re at the demo destination. No order, ticket or reservation has been created.",
    "Sei nella pagina dimostrativa. Non è stato creato alcun ordine, biglietto o prenotazione.",
    "Dies ist das Demo-Ziel. Es wurde keine Bestellung, kein Ticket und keine Reservierung erstellt.",
  ),
};

export function PreviewMark({ locale }: { locale: Locale }) {
  return <div className="v3-preview-mark">{copy.preview[locale]}</div>;
}

const trailerUrl = "https://www.youtube.com/watch?v=kCt7OSTjVGY";
export function Trailer({ locale }: { locale: Locale }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <section
      className="v3-trailer"
      aria-labelledby="trailer-title"
      id="trailer-2026"
    >
      <div className="v3-trailer-frame">
        {loaded ? (
          <iframe
            ref={(frame) => {
              frame?.focus();
            }}
            title={copy.trailer[locale]}
            src="https://www.youtube-nocookie.com/embed/kCt7OSTjVGY?autoplay=1"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className="v3-play"
            onClick={() => setLoaded(true)}
            aria-label={copy.play[locale]}
          >
            <span className="v3-reel" aria-hidden="true">
              <Aperture />
            </span>
            <span>
              <Play size={17} aria-hidden="true" />
              {copy.play[locale]}
            </span>
          </button>
        )}
      </div>
      <div className="v3-trailer-copy">
        <h2 id="trailer-title">{copy.trailer[locale]}</h2>
        <p>{(loaded ? copy.trailerFallback : copy.privacyTrailer)[locale]}</p>
        <a className="editorial-link" href={trailerUrl}>
          {copy.youtube[locale]} <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}

// Add a reviewed PDF URL here when the team supplies the presentation.
const partnerDeck: string | undefined = undefined;
export function PartnersPreview({ locale }: { locale: Locale }) {
  return (
    <div className="v3-chapter">
      <p className="v3-lede">{copy.partners[locale]}</p>
      <p>{copy.partnerIntro[locale]}</p>
      <div className="editorial-grid v3-formats">
        {copy.formats.map((format) => (
          <article key={format.en} className="v3-chapter-card">
            <Aperture aria-hidden="true" />
            <h2>{format[locale]}</h2>
          </article>
        ))}
      </div>
      <section>
        <h2>{copy.historic[locale]}</h2>
        <p>TaxiDrivers · INSURGENCE ({copy.sponsor[locale]})</p>
        <a
          className="editorial-link"
          href="https://www.italyshortfilmdays.com/en/about"
        >
          {ui.source[locale]} <ArrowUpRight size={16} />
        </a>
      </section>
      <section className="v3-chapter-card">
        <h2>{copy.deck[locale]}</h2>
        {partnerDeck ? (
          <a className="editorial-link" href={partnerDeck}>
            {copy.deck[locale]}
          </a>
        ) : (
          <p>{copy.deckPending[locale]}</p>
        )}
      </section>
      <a className="v3-cta" href={link(locale, "contact")}>
        {copy.contact[locale]} <ArrowUpRight size={17} />
      </a>
    </div>
  );
}

export function ContactPreview({ locale }: { locale: Locale }) {
  return (
    <div className="v3-chapter">
      <p className="v3-lede">{copy.contact[locale]}</p>
      <p>{copy.contactIntro[locale]}</p>
      <a className="v3-cta" href="mailto:direzione@taxidrivers.it">
        direzione@taxidrivers.it <ArrowUpRight size={17} />
      </a>
      <p>
        <a
          className="editorial-link"
          href="https://www.italyshortfilmdays.com/en/about"
        >
          {copy.contactSource[locale]}
        </a>
      </p>
      <a className="editorial-link" href={link(locale, "media")}>
        {copy.press[locale]}
      </a>
    </div>
  );
}

// A future server-side provider can implement this contract after consent and privacy review.
export interface NewsletterAdapter {
  subscribe(input: {
    email: string;
    consent: true;
    locale: Locale;
  }): Promise<void>;
}

export function NewsletterPreview({ locale }: { locale: Locale }) {
  const [submitted, setSubmitted] = useState(false);
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  }
  return (
    <div className="v3-chapter">
      <p className="v3-lede">{copy.newsTitle[locale]}</p>
      <p>{copy.newsDemo[locale]}</p>
      <form
        className="v3-news-form"
        onSubmit={validate}
        onChange={() => setSubmitted(false)}
      >
        <label htmlFor="preview-email">{copy.email[locale]}</label>
        <input
          id="preview-email"
          type="email"
          required
          autoComplete="off"
          maxLength={254}
        />
        <label className="v3-consent">
          <input type="checkbox" required />
          {copy.consent[locale]}
        </label>
        <a className="editorial-link" href="#newsletter-privacy">
          {copy.privacy[locale]}
        </a>
        <button className="v3-cta" type="submit">
          {copy.test[locale]}
        </button>
        <p role="status">{submitted ? copy.receipt[locale] : ""}</p>
      </form>
      <section id="newsletter-privacy">
        <h2>{copy.privacy[locale]}</h2>
        <p>{copy.newsDemo[locale]}</p>
      </section>
    </div>
  );
}

const ticketCategories = [
  { label: l("Single screening", "Singola proiezione", "Einzelvorführung") },
  { label: l("Festival pass", "Pass festival", "Festivalpass") },
  {
    label: l(
      "Workshop registration",
      "Iscrizione ai laboratori",
      "Workshop-Anmeldung",
    ),
  },
] as {
  label: ReturnType<typeof l>;
  paymentLink?: `https://buy.stripe.com/${string}`;
}[];

// The director's preview never enables checkout. Future releases must review this gate.
const checkoutEnabled: boolean = false;
export function TicketsPreview({ locale }: { locale: Locale }) {
  const [qr, setQr] = useState<string>();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const destination = link(locale, "tickets") + "#ticket-demo";
  async function generate() {
    setStatus("loading");
    try {
      const { toDataURL } = await import("qrcode");
      setQr(
        await toDataURL(new URL(destination, location.origin).href, {
          width: 256,
          margin: 4,
        }),
      );
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }
  return (
    <div className="v3-chapter">
      <p className="v3-lede">{copy.ticketPitch[locale]}</p>
      <p>{copy.ticketPending[locale]}</p>
      <div className="editorial-grid v3-formats">
        {ticketCategories.map((category) => (
          <article className="v3-chapter-card" key={category.label.en}>
            <h2>{category.label[locale]}</h2>
            {checkoutEnabled && category.paymentLink ? (
              <a className="v3-cta" href={category.paymentLink}>
                {ui.ticket[locale]}
              </a>
            ) : (
              <p>{ui.dates[locale]}</p>
            )}
          </article>
        ))}
      </div>
      <section className="v3-chapter-card" id="ticket-demo">
        <h2>{copy.ticketDemo[locale]}</h2>
        <p>{copy.demoNote[locale]}</p>
        {!qr && (
          <button
            className="v3-cta"
            type="button"
            disabled={status === "loading"}
            onClick={() => void generate()}
          >
            <QrCode size={18} />
            {copy[status === "loading" ? "loading" : "qr"][locale]}
          </button>
        )}
        {status === "error" && <p role="status">{copy.qrFailed[locale]}</p>}
        {qr && (
          <img
            className="v3-demo-qr"
            src={qr}
            width="256"
            height="256"
            alt={copy.ticketDemo[locale]}
          />
        )}
        <a className="editorial-link" href={destination}>
          {copy.ticketDemo[locale]}
        </a>
      </section>
    </div>
  );
}

export function ApprovedExcerpts({
  data,
  locale,
  edition,
}: {
  data: Festival;
  locale: Locale;
  edition?: number;
}) {
  const films = data.films
    .filter(
      (film) =>
        visible(film) &&
        film.discoveryPreview?.rights === "approved" &&
        (edition === undefined || film.edition === edition),
    )
    .slice(0, 3);
  if (!films.length) return null;
  return (
    <section className="editorial-section">
      <h2>
        {l("Film excerpts", "Estratti dei film", "Filmausschnitte")[locale]}
      </h2>
      <div className="editorial-grid">
        {films.map((film) => (
          <FilmCard key={film.id} film={film} locale={locale} />
        ))}
      </div>
    </section>
  );
}
