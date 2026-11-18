export const locales = ["it", "de", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const isLocale = (value: unknown): value is Locale =>
  locales.some((locale) => locale === value);
export const localeNames: Record<Locale, string> = {
  it: "Italiano",
  de: "Deutsch",
  en: "English",
};
export const openGraphLocales: Record<Locale, string> = {
  it: "it_IT",
  de: "de_DE",
  en: "en_GB",
};
export type LocalizedContent = Record<Locale, string>;
export const l = (en: string, it: string, de: string): LocalizedContent => ({
  en,
  it,
  de,
});
export type EditorialStatus = "draft" | "verified" | "published";
interface RecordBase {
  id: string;
  status: EditorialStatus;
  source?: string;
}
export interface FestivalEdition extends RecordBase {
  year: number;
  label: LocalizedContent;
  starts?: string;
  ends?: string;
}
export interface EditorialImage {
  src: string;
  alt: LocalizedContent;
  credit: string;
  rights: "approved" | "pending";
}
export interface EditorialPreview {
  src: string;
  title: LocalizedContent;
  credit: string;
  rights: "approved" | "pending";
  captions?: { src: string; locale: Locale; label: string };
}
export interface Person extends RecordBase {
  edition?: number;
  portrait?: EditorialImage;
  name: string;
  role?: LocalizedContent;
}
export interface Venue extends RecordBase {
  name: string;
  edition: number;
  address?: string;
  map?: string;
  accessibility?: LocalizedContent;
}
export type FilmGenre =
  "experimental" | "classic" | "innovative" | "comedy" | "documentary";
export interface Film extends RecordBase {
  verifiedGenres?: FilmGenre[];
  discoveryPoster?: EditorialImage;
  discoveryPreview?: EditorialPreview;
  title: string;
  directors?: string[];
  edition: number;
  year?: number;
  country?: LocalizedContent;
  minutes?: number;
  language?: LocalizedContent;
  subtitles?: LocalizedContent;
  synopsis?: Partial<LocalizedContent>;
  poster?: string;
  stills?: string[];
  trailer?: string;
  cast?: string[];
  crew?: string[];
  links?: string[];
}
export interface Screening extends RecordBase {
  edition: number;
  date?: string;
  times?: string[];
  venueId?: string;
  filmIds: string[];
  title: LocalizedContent;
}
export type Category =
  | "press"
  | "education"
  | "industry"
  | "screenings"
  | "community"
  | "talks"
  | "workshops"
  | "schools"
  | "exhibitions"
  | "social";
export interface FestivalEvent extends RecordBase {
  edition: number;
  day: number;
  date?: string;
  time?: string;
  category: Category;
  venueId?: string;
  title: LocalizedContent;
  description?: LocalizedContent;
  participants?: string[];
  filmIds?: string[];
  registration?: string;
  period?: "day" | "night";
  confirmation?: "concept" | "confirmed";
}
export const isConfirmedEvent = (event: FestivalEvent) =>
  event.confirmation === "confirmed" && Boolean(event.source);
export interface Workshop extends FestivalEvent {
  facilitator?: string;
}
export interface TicketOffer extends RecordBase {
  edition: number;
  label: LocalizedContent;
  url?: string;
  kind: "pass" | "screening" | "registration";
}
export interface PodcastEpisode extends RecordBase {
  title: LocalizedContent;
  url?: string;
  edition?: number;
}
export interface NewsArticle extends RecordBase {
  title: LocalizedContent;
  summary: LocalizedContent;
  url: string;
  kind: "press" | "interview" | "video" | "news" | "editorial";
}
export interface Award extends RecordBase {
  edition: number;
  title: LocalizedContent;
  recipient: string;
  filmId?: string;
}
export interface Partner extends RecordBase {
  name: string;
  edition: number;
  url?: string;
}
export interface ArchiveMedia extends RecordBase {
  year: number;
  kind:
    | "featured"
    | "gallery"
    | "clips"
    | "aftermovie"
    | "interviews"
    | "screenings"
    | "awards"
    | "backstage"
    | "press";
  format: "image" | "video" | "link";
  url: string;
  caption: LocalizedContent;
  credit: string;
  rights: "pending" | "approved";
  captions?: EditorialPreview["captions"];
  language?: Locale;
  filmIds?: string[];
}
export interface Festival {
  archiveMedia?: ArchiveMedia[];
  editions: FestivalEdition[];
  events: FestivalEvent[];
  films: Film[];
  screenings: Screening[];
  venues: Venue[];
  awards: Award[];
  articles: NewsArticle[];
  people: Person[];
  partners: Partner[];
  tickets: TicketOffer[];
  workshops: Workshop[];
  podcasts: PodcastEpisode[];
}
export interface FestivalRepository {
  getFestival(): Promise<Festival>;
}
export const visible = ({ status }: RecordBase) => status === "published";
export const translate = (copy: LocalizedContent, locale: Locale) =>
  copy[locale];
export const localizedEditorialText = (
  copy: Partial<LocalizedContent> | undefined,
  locale: Locale,
) => copy?.[locale]?.trim() || undefined;
export const days = [
  l("Monday", "Lunedì", "Montag"),
  l("Tuesday", "Martedì", "Dienstag"),
  l("Wednesday", "Mercoledì", "Mittwoch"),
  l("Thursday", "Giovedì", "Donnerstag"),
  l("Friday", "Venerdì", "Freitag"),
  l("Saturday", "Sabato", "Samstag"),
  l("Sunday", "Domenica", "Sonntag"),
];
export const categories: Record<Category, LocalizedContent> = {
  press: l("Press", "Stampa", "Presse"),
  education: l("Education", "Formazione", "Filmbildung"),
  industry: l("Industry", "Industria", "Filmbranche"),
  screenings: l("Screenings", "Proiezioni", "Vorführungen"),
  community: l("Community", "Comunità", "Begegnungen"),
  talks: l("Talks", "Incontri", "Gespräche"),
  workshops: l("Workshops", "Laboratori", "Workshops"),
  schools: l("Schools", "Scuole", "Schulen"),
  exhibitions: l("Exhibitions", "Mostre", "Ausstellungen"),
  social: l("Social events", "Eventi sociali", "Gemeinsame Veranstaltungen"),
};
const event = (
  id: string,
  day: number,
  category: Category,
  en: string,
  it: string,
  de: string,
  period?: FestivalEvent["period"],
): FestivalEvent => ({
  id,
  day,
  category,
  title: l(en, it, de),
  period,
  confirmation: "concept",
  edition: 2027,
  status: "published",
});
export const events = [
  event(
    "press-conference",
    0,
    "press",
    "Press conference",
    "Conferenza stampa",
    "Pressekonferenz",
  ),
  event(
    "press-interviews",
    0,
    "press",
    "Press interviews",
    "Interviste per la stampa",
    "Presseinterviews",
  ),
  event(
    "social",
    0,
    "press",
    "Social media production",
    "Produzione di contenuti per i social",
    "Produktion von Social-Media-Inhalten",
  ),
  event(
    "premiere",
    0,
    "screenings",
    "Podcast premiere / first screening",
    "Debutto del podcast / prima proiezione",
    "Podcast-Premiere / erste Filmvorführung",
  ),
  event(
    "opening",
    0,
    "community",
    "Festival programme introduction",
    "Presentazione del programma",
    "Vorstellung des Festivalprogramms",
  ),
  event(
    "school-films",
    1,
    "schools",
    "School screenings",
    "Proiezioni per le scuole",
    "Schulvorführungen",
  ),
  event(
    "film-education",
    1,
    "schools",
    "Film education",
    "Educazione al cinema",
    "Filmvermittlung",
  ),
  event(
    "student-discussions",
    1,
    "schools",
    "Student discussions",
    "Discussioni con le classi",
    "Gespräche mit Schulklassen",
  ),
  event(
    "school-guests",
    1,
    "schools",
    "Filmmaker encounters",
    "Incontri con chi fa cinema",
    "Begegnungen mit Filmschaffenden",
  ),
  event(
    "young-workshops",
    1,
    "schools",
    "Kids’ workshops",
    "Laboratori per bambini",
    "Workshops für Kinder",
  ),
  event(
    "actor-talks",
    2,
    "talks",
    "Actor Talks",
    "Incontri con attori e attrici",
    "Gespräche mit Schauspielenden",
  ),
  event(
    "director-talks",
    2,
    "talks",
    "Director Talks",
    "Incontri con registi e registe",
    "Regiegespräche",
  ),
  event(
    "podcast-studio",
    2,
    "talks",
    "Podcast Studio",
    "Studio podcast",
    "Podcaststudio",
  ),
  event(
    "industry-interviews",
    2,
    "talks",
    "Industry interviews",
    "Interviste con professionisti del settore",
    "Interviews mit Fachleuten aus der Filmbranche",
  ),
  event("workshops", 2, "workshops", "Workshops", "Laboratori", "Workshops"),
  event(
    "masterclasses",
    2,
    "workshops",
    "Masterclasses",
    "Masterclass",
    "Masterclasses",
  ),
  event(
    "industry-networking",
    2,
    "industry",
    "Professional meetings and networking",
    "Incontri professionali e networking",
    "Branchentreffen und Vernetzung",
  ),
  event(
    "thu-day",
    3,
    "screenings",
    "Daytime short-film programmes",
    "Programmi di cortometraggi diurni",
    "Kurzfilmprogramme tagsüber",
    "day",
  ),
  event(
    "thu-night",
    3,
    "screenings",
    "Evening and night screenings",
    "Proiezioni serali e notturne",
    "Vorführungen am Abend und in der Nacht",
    "night",
  ),
  event(
    "thu-qa",
    3,
    "talks",
    "Filmmaker Q&A",
    "Domande e risposte con registi e registe",
    "Publikumsgespräch mit Filmschaffenden",
  ),
  event(
    "fri-day",
    4,
    "screenings",
    "Daytime programmes",
    "Programmi diurni",
    "Tagesprogramm",
    "day",
  ),
  event(
    "fri-night",
    4,
    "screenings",
    "Night programmes",
    "Programmi notturni",
    "Nachtprogramm",
    "night",
  ),
  event(
    "selection",
    4,
    "screenings",
    "Official Selection",
    "Selezione ufficiale",
    "Offizielle Auswahl",
  ),
  event(
    "fri-guests",
    4,
    "talks",
    "Filmmaker encounters",
    "Incontri con chi fa cinema",
    "Begegnungen mit Filmschaffenden",
  ),
  event(
    "sat-day",
    5,
    "screenings",
    "Daytime screenings",
    "Proiezioni diurne",
    "Vorführungen tagsüber",
    "day",
  ),
  event(
    "sat-night",
    5,
    "screenings",
    "Night screenings",
    "Proiezioni notturne",
    "Nachtvorführungen",
    "night",
  ),
  event(
    "afterparty",
    5,
    "social",
    "Festival Afterparty",
    "Festa del festival",
    "Festival-Abschlussparty",
  ),
  event(
    "brunch",
    6,
    "social",
    "Community meetup",
    "Incontro con la comunità",
    "Treffen der Festivalgemeinschaft",
  ),
  event(
    "contributors",
    6,
    "community",
    "Filmmakers, participants and contributors",
    "Registi, partecipanti e persone che hanno contribuito",
    "Filmschaffende, Teilnehmende und Mitwirkende",
  ),
  event(
    "partners",
    6,
    "community",
    "Partners and collaborators",
    "Partner e collaboratori",
    "Partner und Kooperationsbeteiligte",
  ),
  event(
    "wrap",
    6,
    "community",
    "Informal networking and festival wrap-up",
    "Networking informale e chiusura del festival",
    "Informeller Austausch und Festivalausklang",
  ),
];
