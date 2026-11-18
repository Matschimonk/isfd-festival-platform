export type Locale = "en" | "it";
export type LocalizedContent = Record<Locale, string>;
export const l = (en: string, it: string): LocalizedContent => ({ en, it });
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
export interface Person extends RecordBase {
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
export interface Film extends RecordBase {
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
  "press" | "education" | "industry" | "screenings" | "community";
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
}
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
export interface Festival {
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
export const translate = (copy: Partial<LocalizedContent>, locale: Locale) =>
  copy[locale] ?? copy.en ?? copy.it ?? "";
export const days = [
  l("Monday", "Lunedì"),
  l("Tuesday", "Martedì"),
  l("Wednesday", "Mercoledì"),
  l("Thursday", "Giovedì"),
  l("Friday", "Venerdì"),
  l("Saturday", "Sabato"),
  l("Sunday", "Domenica"),
];
export const themes = [
  l("Press & Opening Day", "Stampa e apertura"),
  l("Schools & Young Audiences", "Scuole e giovani spettatori"),
  l("Industry & Conversations", "Industria e conversazioni"),
  l("Official Screenings", "Proiezioni ufficiali"),
  l("Official Screenings", "Proiezioni ufficiali"),
  l("Screenings & Afterparty", "Proiezioni e festa"),
  l("Soft Landing Brunch", "Brunch di chiusura"),
];
export const categories: Record<Category, LocalizedContent> = {
  press: l("Press", "Stampa"),
  education: l("Education", "Formazione"),
  industry: l("Industry", "Industria"),
  screenings: l("Screenings", "Proiezioni"),
  community: l("Community", "Comunità"),
};
const event = (
  id: string,
  day: number,
  category: Category,
  en: string,
  it: string,
  period?: FestivalEvent["period"],
): FestivalEvent => ({
  id,
  day,
  category,
  title: l(en, it),
  period,
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
  ),
  event(
    "press-interviews",
    0,
    "press",
    "Press interviews",
    "Interviste per la stampa",
  ),
  event(
    "social",
    0,
    "press",
    "Social media production",
    "Produzione di contenuti per i social",
  ),
  event(
    "premiere",
    0,
    "screenings",
    "Podcast premiere / first screening",
    "Debutto del podcast / prima proiezione",
  ),
  event(
    "opening",
    0,
    "community",
    "Festival programme introduction",
    "Presentazione del programma",
  ),
  event(
    "school-films",
    1,
    "screenings",
    "School screenings",
    "Proiezioni per le scuole",
  ),
  event(
    "film-education",
    1,
    "education",
    "Film education",
    "Educazione al cinema",
  ),
  event(
    "student-discussions",
    1,
    "education",
    "Student discussions",
    "Discussioni con le classi",
  ),
  event(
    "school-guests",
    1,
    "education",
    "Filmmaker encounters",
    "Incontri con chi fa cinema",
  ),
  event(
    "industry-interviews",
    2,
    "industry",
    "Industry interviews",
    "Interviste con professionisti del settore",
  ),
  event("workshops", 2, "education", "Workshops", "Laboratori"),
  event("masterclasses", 2, "education", "Masterclasses", "Masterclass"),
  event(
    "industry-networking",
    2,
    "industry",
    "Professional meetings and networking",
    "Incontri professionali e networking",
  ),
  event(
    "thu-day",
    3,
    "screenings",
    "Daytime short-film programmes",
    "Programmi di cortometraggi diurni",
    "day",
  ),
  event(
    "thu-night",
    3,
    "screenings",
    "Evening and night screenings",
    "Proiezioni serali e notturne",
    "night",
  ),
  event(
    "thu-qa",
    3,
    "industry",
    "Filmmaker Q&A",
    "Domande e risposte con registi e registe",
  ),
  event(
    "fri-day",
    4,
    "screenings",
    "Daytime programmes",
    "Programmi diurni",
    "day",
  ),
  event(
    "fri-night",
    4,
    "screenings",
    "Night programmes",
    "Programmi notturni",
    "night",
  ),
  event(
    "selection",
    4,
    "screenings",
    "Official Selection",
    "Selezione ufficiale",
  ),
  event(
    "fri-guests",
    4,
    "industry",
    "Filmmaker encounters",
    "Incontri con chi fa cinema",
  ),
  event(
    "sat-day",
    5,
    "screenings",
    "Daytime screenings",
    "Proiezioni diurne",
    "day",
  ),
  event(
    "sat-night",
    5,
    "screenings",
    "Night screenings",
    "Proiezioni notturne",
    "night",
  ),
  event(
    "afterparty",
    5,
    "community",
    "Festival Afterparty",
    "Festa del festival",
  ),
  event(
    "brunch",
    6,
    "community",
    "Community meetup",
    "Incontro con la comunità",
  ),
  event(
    "contributors",
    6,
    "community",
    "Filmmakers, participants and contributors",
    "Registi, partecipanti e persone che hanno contribuito",
  ),
  event(
    "partners",
    6,
    "community",
    "Partners and collaborators",
    "Partner e collaboratori",
  ),
  event(
    "wrap",
    6,
    "community",
    "Informal networking and festival wrap-up",
    "Networking informale e chiusura del festival",
  ),
];
