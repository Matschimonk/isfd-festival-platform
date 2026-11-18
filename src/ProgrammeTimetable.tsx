import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  List,
  Moon,
  Sun,
} from "lucide-react";
import {
  categories,
  days,
  isConfirmedEvent,
  l,
  visible,
  type Category,
  type Festival,
  type FestivalEvent,
  type FilmGenre,
  type Locale,
} from "./content";
import { pages, ui } from "./copy";
import { SocialProgramme } from "./Experience";
import { experience, festivalWeek, genres } from "./experience-content";
import { link } from "./routes";

const copy = {
  title: l(
    "Plan your festival",
    "Organizza la tua visita",
    "Plane deinen Festivalbesuch",
  ),
  intro: l(
    "Explore the proposed seven-day programme and save ideas for your visit. Concept entries can change.",
    "Esplora la proposta di programma dei sette giorni e salva le idee per la tua visita. Gli appuntamenti in anteprima possono cambiare.",
    "Entdecke den Entwurf für die sieben Festivaltage und merke dir Programmpunkte für deinen Besuch. Die Vorschau kann sich ändern.",
  ),
  week: l("Week", "Settimana", "Woche"),
  daily: l("Day", "Giorno", "Tag"),
  view: l("Timetable view", "Vista del calendario", "Ansicht des Zeitplans"),
  myFestival: l("My Festival", "Il mio festival", "Mein Festival"),
  allVenue: l("All venues", "Tutte le sedi", "Alle Spielorte"),
  allGenre: l("All genres", "Tutti i generi", "Alle Genres"),
  venue: l("Venue", "Sede", "Spielort"),
  genre: l("Genre", "Genere", "Genre"),
  pending: l(
    "Venue and genre filters require verified programme details.",
    "I filtri per sede e genere richiedono informazioni verificate.",
    "Filter für Spielorte und Genres setzen bestätigte Programmdaten voraus.",
  ),
  pendingVenue: l(
    "Venue filter pending",
    "Filtro sedi in attesa di conferma",
    "Spielortfilter folgt",
  ),
  pendingGenre: l(
    "Genre filter pending",
    "Filtro generi in attesa di conferma",
    "Genrefilter folgt",
  ),
  concept: l("Concept", "Proposta", "Vorschau"),
  confirmed: l("Confirmed", "Confermato", "Bestätigt"),
  timePending: l(
    "Time to be confirmed",
    "Orario da confermare",
    "Uhrzeit folgt",
  ),
  venuePending: l(
    "Venue to be confirmed",
    "Sede da confermare",
    "Spielort folgt",
  ),
  unassigned: l(
    "Without confirmed times",
    "Orari da confermare",
    "Uhrzeiten folgen",
  ),
  otherPeriods: l(
    "Choose All to include entries without a day or night slot.",
    "Seleziona Tutto per includere le proposte senza fascia oraria.",
    "Wähle Alle, um auch Einträge ohne Tages- oder Nachtzuordnung zu sehen.",
  ),
  noMatch: l(
    "No entries match these filters.",
    "Nessun appuntamento corrisponde ai filtri.",
    "Keine Einträge entsprechen diesen Filtern.",
  ),
  noDay: l(
    "Programme to follow.",
    "Programma in preparazione.",
    "Programm folgt.",
  ),
  noSaved: l(
    "Nothing saved yet. Use the bookmark on an event to add it here.",
    "Non hai ancora salvato appuntamenti. Usa il segnalibro di un evento per aggiungerlo qui.",
    "Hier stehen deine gemerkten Programmpunkte. Wähle dazu das Lesezeichen bei einem Eintrag.",
  ),
  savedHint: l(
    "This shortlist stays in this browser.",
    "La lista rimane in questo browser.",
    "Deine Merkliste bleibt in diesem Browser.",
  ),
  reset: l("Reset filters", "Azzera filtri", "Filter zurücksetzen"),
  results: l(
    "Entries shown",
    "Appuntamenti visualizzati",
    "Angezeigte Einträge",
  ),
  details: l("Details", "Dettagli", "Details"),
  save: l(
    "Save to My Festival",
    "Salva ne Il mio festival",
    "In Mein Festival merken",
  ),
  remove: l(
    "Remove from My Festival",
    "Rimuovi da Il mio festival",
    "Aus Mein Festival entfernen",
  ),
};

const shortDays = [
  l("Mon", "Lun", "Mo"),
  l("Tue", "Mar", "Di"),
  l("Wed", "Mer", "Mi"),
  l("Thu", "Gio", "Do"),
  l("Fri", "Ven", "Fr"),
  l("Sat", "Sab", "Sa"),
  l("Sun", "Dom", "So"),
];
const savedKey = "isfd-my-festival-v1";
let temporarySaved = "[]";
function savedSnapshot() {
  try {
    return localStorage.getItem(savedKey) ?? "[]";
  } catch {
    return temporarySaved;
  }
}
function subscribeToSaved(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener(savedKey, update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener(savedKey, update);
  };
}
function decodeSaved(raw: string) {
  try {
    const values: unknown = JSON.parse(raw);
    if (Array.isArray(values))
      return new Set(
        values.filter((id): id is string => typeof id === "string"),
      );
  } catch {
    // A corrupt preference is treated as an empty shortlist.
  }
  return new Set<string>();
}
function useSavedEvents() {
  return decodeSaved(
    useSyncExternalStore(subscribeToSaved, savedSnapshot, () => "[]"),
  );
}

export function SaveEvent({
  event,
  locale,
  showText = false,
  afterRemove,
}: {
  event: FestivalEvent;
  locale: Locale;
  showText?: boolean;
  afterRemove?: () => void;
}) {
  const id = `${event.edition}/${event.id}`;
  const saved = useSavedEvents().has(id);
  const action = (saved ? copy.remove : copy.save)[locale];
  return (
    <button
      type="button"
      className="planner-save timetable-interactive"
      aria-label={`${copy.myFestival[locale]} · ${event.title[locale]}`}
      aria-pressed={saved}
      title={action}
      onClick={() => {
        const next = decodeSaved(savedSnapshot());
        const removed = next.delete(id);
        if (!removed) next.add(id);
        temporarySaved = JSON.stringify([...next]);
        try {
          localStorage.setItem(savedKey, temporarySaved);
        } catch {
          // Retain the shortlist for the current page when storage is blocked.
        }
        window.dispatchEvent(new Event(savedKey));
        if (removed) afterRemove?.();
      }}
    >
      <Bookmark
        size={17}
        aria-hidden="true"
        fill={saved ? "currentColor" : "none"}
      />
      {showText && copy.myFestival[locale]}
    </button>
  );
}

const related = {
  screenings: "films",
  education: "academy",
  industry: "academy",
  schools: "academy",
  talks: "academy",
  workshops: "academy",
  press: "media",
} as const satisfies Partial<Record<Category, keyof typeof pages>>;

type PlannerEvent = {
  event: FestivalEvent;
  films: Festival["films"];
  venue?: Festival["venues"][number];
};
type Period = "both" | "day" | "night";
type View = "week" | "day" | "saved";

function EventCard({
  item,
  locale,
  compact,
  afterRemove,
}: {
  item: PlannerEvent;
  locale: Locale;
  compact: boolean;
  afterRemove?: () => void;
}) {
  const { event, films, venue } = item;
  const heading = `planner-event-${event.id}`;
  const section = related[event.category as keyof typeof related];
  const social =
    event.category === "exhibitions" || event.category === "social";
  return (
    <article className="planner-card" aria-labelledby={heading}>
      <div className="planner-card-top">
        <span className="planner-badge">
          {(isConfirmedEvent(event) ? copy.confirmed : copy.concept)[locale]}
        </span>
        <SaveEvent event={event} locale={locale} afterRemove={afterRemove} />
      </div>
      <h4 id={heading}>{event.title[locale]}</h4>
      <p className="planner-card-category">
        {categories[event.category][locale]}
        {event.period && ` · ${experience[event.period][locale]}`}
      </p>
      {event.time ? (
        <p className="planner-time">{event.time}</p>
      ) : (
        compact && <p className="planner-time">{copy.timePending[locale]}</p>
      )}
      {!compact && (
        <p className="planner-card-venue">
          {venue ? (
            <a href={link(locale, "venues", venue.id)}>{venue.name}</a>
          ) : (
            copy.venuePending[locale]
          )}
        </p>
      )}
      {!compact && event.description && <p>{event.description[locale]}</p>}
      {!compact && films.length > 0 && (
        <ul className="planner-films">
          {films.map((film) => (
            <li key={film.id}>
              <a href={link(locale, "films", film.id)}>{film.title}</a>
            </li>
          ))}
        </ul>
      )}
      <div className="planner-card-links">
        <a
          className="editorial-link"
          href={link(locale, "programme", event.id)}
          aria-label={`${copy.details[locale]} · ${event.title[locale]}`}
        >
          {copy.details[locale]} <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        {!compact && section && (
          <a href={link(locale, section)}>{pages[section][locale]}</a>
        )}
        {!compact && social && (
          <a href="#social">{experience.social[locale]}</a>
        )}
      </div>
    </article>
  );
}

function dayFromHash() {
  const day = /^#day-([0-6])$/.exec(location.hash);
  return day ? Number(day[1]) : undefined;
}

export function ProgrammeTimetable({
  data,
  locale,
}: {
  data: Festival;
  locale: Locale;
}) {
  const [view, setView] = useState<View>("week");
  const [day, setDay] = useState(0);
  const [category, setCategory] = useState<Category | "">("");
  const [period, setPeriod] = useState<Period>("both");
  const [venueId, setVenue] = useState("");
  const [genre, setGenre] = useState<FilmGenre | "">("");
  const shortlist = useSavedEvents();
  const shortlistButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function syncDay() {
      const selected = dayFromHash();
      if (selected !== undefined) {
        setDay(selected);
        setView("day");
      }
    }
    syncDay();
    window.addEventListener("hashchange", syncDay);
    return () => window.removeEventListener("hashchange", syncDay);
  }, []);

  function setActiveView(next: View, nextDay = day) {
    setView(next);
    setDay(nextDay);
    const url = new URL(location.href);
    if (next === "day") url.hash = `day-${nextDay}`;
    else if (dayFromHash() !== undefined) url.hash = "";
    history.replaceState(history.state, "", url);
  }

  function resetFilters() {
    setCategory("");
    setPeriod("both");
    setVenue("");
    setGenre("");
  }

  const source = data.events.filter(
    (event) => visible(event) && event.edition === 2027,
  );
  const items: PlannerEvent[] = source.map((event) => ({
    event,
    venue: isConfirmedEvent(event)
      ? data.venues.find(
          (venue) =>
            visible(venue) &&
            venue.source &&
            venue.id === event.venueId &&
            venue.edition === event.edition,
        )
      : undefined,
    films: isConfirmedEvent(event)
      ? data.films.filter(
          (film) =>
            visible(film) &&
            film.edition === event.edition &&
            event.filmIds?.includes(film.id),
        )
      : [],
  }));
  const venueChoices = [
    ...new Map(
      items.flatMap(({ venue }) => (venue ? [[venue.id, venue] as const] : [])),
    ).values(),
  ];
  const genreChoices = [
    ...new Set(
      items.flatMap(({ films }) =>
        films.flatMap((film) => film.verifiedGenres ?? []),
      ),
    ),
  ];
  const saved = items.filter(({ event }) =>
    shortlist.has(`${event.edition}/${event.id}`),
  );
  const matches = (view === "saved" ? saved : items).filter(
    ({ event, venue, films }) =>
      (view !== "day" || event.day === day) &&
      (view === "saved" ||
        ((!category || event.category === category) &&
          (period === "both" || event.period === period) &&
          (!venueId || venue?.id === venueId) &&
          (!genre ||
            films.some((film) => film.verifiedGenres?.includes(genre))))),
  );
  const inactiveFilters = !category && period === "both" && !venueId && !genre;
  const hasMatches = matches.length > 0;
  const indexes =
    view === "day"
      ? [day]
      : hasMatches || inactiveFilters
        ? days.map((_, index) => index)
        : [];
  const ordered = (a: PlannerEvent, b: PlannerEvent) =>
    (a.event.time ?? "99:99")
      .padStart(5, "0")
      .localeCompare((b.event.time ?? "99:99").padStart(5, "0"));

  return (
    <>
      <section className="planner" aria-labelledby="planner-title">
        <div className="planner-heading">
          <div>
            <h2 id="planner-title">{copy.title[locale]}</h2>
            <p>{copy.intro[locale]}</p>
          </div>
          <button
            type="button"
            ref={shortlistButton}
            className="planner-shortlist timetable-interactive"
            aria-pressed={view === "saved"}
            onClick={() => setActiveView(view === "saved" ? "week" : "saved")}
          >
            <Bookmark size={17} aria-hidden="true" /> {copy.myFestival[locale]}{" "}
            <span>{saved.length}</span>
          </button>
        </div>
        <div className="planner-control-panel timetable-interactive">
          <div
            className="planner-views"
            role="group"
            aria-label={copy.view[locale]}
          >
            <button
              type="button"
              aria-pressed={view === "week"}
              onClick={() => setActiveView("week")}
            >
              <CalendarDays size={16} aria-hidden="true" /> {copy.week[locale]}
            </button>
            <button
              type="button"
              aria-pressed={view === "day"}
              onClick={() => setActiveView("day")}
            >
              <List size={16} aria-hidden="true" /> {copy.daily[locale]}
            </button>
          </div>
          <div
            className="planner-days"
            role="group"
            aria-label={ui.day[locale]}
          >
            {shortDays.map((label, index) => (
              <button
                type="button"
                key={index}
                aria-label={days[index][locale]}
                aria-pressed={view === "day" && day === index}
                onClick={() => setActiveView("day", index)}
              >
                {label[locale]}
              </button>
            ))}
          </div>
          {view !== "saved" && (
            <>
              <div className="planner-filters">
                <div>
                  <label htmlFor="planner-category">
                    {ui.category[locale]}
                  </label>
                  <select
                    id="planner-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as Category | "")
                    }
                  >
                    <option value="">{ui.allCategories[locale]}</option>
                    {Object.entries(categories)
                      .filter(([id]) =>
                        source.some((event) => event.category === id),
                      )
                      .map(([id, label]) => (
                        <option key={id} value={id}>
                          {label[locale]}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="planner-venue">{copy.venue[locale]}</label>
                  <select
                    id="planner-venue"
                    value={venueId}
                    onChange={(e) => setVenue(e.target.value)}
                    disabled={!venueChoices.length}
                  >
                    <option value="">
                      {
                        (venueChoices.length
                          ? copy.allVenue
                          : copy.pendingVenue)[locale]
                      }
                    </option>
                    {venueChoices.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="planner-genre">{copy.genre[locale]}</label>
                  <select
                    id="planner-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as FilmGenre | "")}
                    disabled={!genreChoices.length}
                  >
                    <option value="">
                      {
                        (genreChoices.length
                          ? copy.allGenre
                          : copy.pendingGenre)[locale]
                      }
                    </option>
                    {genreChoices.map((value) => (
                      <option key={value} value={value}>
                        {genres[value][locale]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                className="planner-period"
                role="group"
                aria-label={experience.rhythm[locale]}
              >
                {(["both", "day", "night"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={period === option}
                    onClick={() => setPeriod(option)}
                  >
                    {option === "day" && <Sun size={16} aria-hidden="true" />}
                    {option === "night" && (
                      <Moon size={16} aria-hidden="true" />
                    )}
                    {experience[option][locale]}
                  </button>
                ))}
              </div>
              {(!venueChoices.length || !genreChoices.length) && (
                <p className="planner-help">{copy.pending[locale]}</p>
              )}
              {period !== "both" && (
                <p className="planner-help">{copy.otherPeriods[locale]}</p>
              )}
              {!inactiveFilters && (
                <button
                  type="button"
                  className="planner-reset"
                  onClick={resetFilters}
                >
                  {copy.reset[locale]}
                </button>
              )}
            </>
          )}
        </div>
        {view === "saved" && (
          <p className="planner-status">{copy.savedHint[locale]}</p>
        )}
        <div className="planner-status" role="status">
          {copy.results[locale]} · {matches.length}
          {!hasMatches && (
            <p>
              {
                (view === "saved"
                  ? copy.noSaved
                  : inactiveFilters
                    ? copy.noDay
                    : copy.noMatch)[locale]
              }
            </p>
          )}
        </div>
        <div className={`planner-results planner-${view}`}>
          {indexes.map((index) => {
            const entries = matches
              .filter(({ event }) => event.day === index)
              .sort(ordered);
            const scheduled = entries.filter(({ event }) => event.time);
            const unscheduled = entries.filter(({ event }) => !event.time);
            if (view === "saved" && !entries.length) return null;
            return (
              <section
                className="planner-day"
                key={index}
                id={`day-${index}`}
                aria-labelledby={`planner-day-${index}`}
              >
                <div className="planner-day-heading">
                  <h3 id={`planner-day-${index}`}>{days[index][locale]}</h3>
                  <p>{festivalWeek[index].title[locale]}</p>
                  {view === "day" && <p>{festivalWeek[index].line[locale]}</p>}
                </div>
                {!entries.length && (
                  <p className="planner-day-empty">
                    {(inactiveFilters ? copy.noDay : copy.noMatch)[locale]}
                  </p>
                )}
                {view === "day" &&
                (scheduled.length > 0 || unscheduled.length > 0) ? (
                  <>
                    {scheduled.map((item) => (
                      <div key={item.event.id} className="planner-moment">
                        <span aria-hidden="true">{item.event.time}</span>
                        <EventCard
                          item={item}
                          locale={locale}
                          compact={false}
                        />
                      </div>
                    ))}
                    {unscheduled.length > 0 && (
                      <section
                        className="planner-floating"
                        aria-label={copy.unassigned[locale]}
                      >
                        <p>{copy.unassigned[locale]}</p>
                        {unscheduled.map((item) => (
                          <EventCard
                            key={item.event.id}
                            item={item}
                            locale={locale}
                            compact={false}
                          />
                        ))}
                      </section>
                    )}
                  </>
                ) : (
                  entries.map((item) => (
                    <EventCard
                      key={item.event.id}
                      item={item}
                      locale={locale}
                      compact={view === "week"}
                      afterRemove={
                        view === "saved"
                          ? () => shortlistButton.current?.focus()
                          : undefined
                      }
                    />
                  ))
                )}
              </section>
            );
          })}
        </div>
      </section>
      <SocialProgramme locale={locale} />
    </>
  );
}
