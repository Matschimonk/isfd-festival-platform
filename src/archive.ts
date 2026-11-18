import {
  l,
  events,
  type Festival,
  type FestivalRepository,
  type Film,
  type Screening,
} from "./content";

const experience = "https://www.italyshortfilmdays.com/en/experience";
const lineup = "https://www.italyshortfilmdays.com/en/line";
const schedule = "https://www.italyshortfilmdays.com/it/program";
const press =
  "https://www.taxidrivers.it/533140/italy-short-film-days/italy-short-film-days-berlin-screening-programm.html";
const published = "published" as const;
const film = (
  id: string,
  title: string,
  directors: string[],
  minutes: number,
): Film => ({
  id,
  title,
  directors,
  minutes,
  edition: 2026,
  status: published,
  source: schedule,
  links: [lineup],
});

const blocks = [
  [
    {
      ...film("bellissima", "Bellissima", ["Alessandro Capitani"], 12),
      year: 2015,
      country: l("Italy", "Italia", "Italien"),
      synopsis: l(
        "After being mocked at a nightclub, Veronica retreats to the bathroom. An unexpected encounter changes the course of her night.",
        "Derisa in discoteca, Veronica si rifugia in bagno. Un incontro inatteso cambia il corso della serata.",
        "Nachdem Veronica in einem Nachtclub verspottet wurde, zieht sie sich auf die Toilette zurück. Eine unerwartete Begegnung gibt ihrem Abend eine neue Wendung.",
      ),
      links: ["https://www.sayonarafilm.com/project/bellissima/"],
    },
    film("matilde", "Il primo giorno di Matilde", ["Rosario Capozzolo"], 10),
    film("anime-vive", "Anime vive", ["Adam Selo"], 9),
    film("parru", "Parru pi tia", ["Giuseppe Carleo"], 14),
    film("randaghi", "Randaghi", ["Enrico Motti", "Emanuele Motti"], 15),
    film("piantone", "Il piantone", ["Flavia Mastrella", "Antonio Rezza"], 14),
  ],
  [
    film("a-domani", "A domani", ["Emanuele Vicorito"], 18),
    {
      ...film("playing-god", "Playing God", ["Matteo Burani"], 9),
      year: 2024,
      country: l("Italy, France", "Italia, Francia", "Italien, Frankreich"),
      synopsis: l(
        "A sculptor’s pursuit of perfection brings a clay figure to life.",
        "La ricerca della perfezione da parte di uno scultore dà vita a una figura d’argilla.",
        "Auf der Suche nach Vollkommenheit erweckt ein Bildhauer eine Tonfigur zum Leben.",
      ),
      links: ["https://sicvenezia.it/en/films/playing-god/"],
    },
    film("confessione", "La confessione", ["Nicola Sorcinelli"], 15),
    film("niente", "Niente di speciale", ["Giovanni Conte"], 19),
    film("aspis", "Aspis", ["Antonio Romagnoli"], 14),
    film("fiori", "Fiori cadono", ["Ludovica Galletta"], 17),
    film("teresina", "Teresina", ["Irene Belluzzi"], 20),
    film("afternoon-call", "Afternoon Call", ["Maddalena Cellerino"], 5),
  ],
  [
    film("plutone", "Plutone", ["Alessandro Padovani"], 15),
    film("marcello", "Marcello", ["Maurizio Lombardi"], 20),
    film("mur-du-son", "Le Mur du Son", ["Antonio La Camera"], 12),
    {
      ...film(
        "quand-tu-dors",
        "Quand tu dors",
        ["Pierluigi Rosa", "Salvator Rosa"],
        17,
      ),
      links: [lineup, "https://www.festivaldelcinemaeuropeo.com/en/?p=12314"],
    },
    film("majoneze", "Majonezë", ["Giulia Grandinetti"], 22),
    film("maestrale", "Maestrale", ["Nico Bonomolo"], 10),
    {
      ...film("fiji", "Fiji", ["Andrea Lamedica"], 11),
      links: [lineup, "https://www.lightsonfilm.com/fiji.html"],
    },
    film("fantasmi", "I fantasmi", ["Federico Papagna"], 15),
  ],
  [
    film("pinocchio", "Pinocchio Reborn", ["Matteo Cirillo"], 15),
    film("domenica", "Domenica Sera", ["Matteo Tortone"], 16),
    film("tempi", "Tempi supplementari", ["Matteo Memè"], 14),
    film("marina", "Marina", ["Paoli De Luca"], 19),
    film("ciao-varsavia", "Ciao Varsavia", ["Diletta Di Nicolantonio"], 19),
    {
      ...film(
        "juggernaut",
        "Juggernaut",
        ["Daniele Ricci", "Emanuele Ricci"],
        20,
      ),
      links: [lineup, "https://www.gioveshortfilmfestival.it/en/juggernaut/"],
    },
    film(
      "cane-gatto",
      "Un cane miagola un gatto abbaia",
      ["Alessandro Prato"],
      18,
    ),
    film("1799-diario", "1799, diario", ["Fulvio Risuleo"], 17),
  ],
];
const screenings: Screening[] = [
  {
    id: "2026-opening",
    date: "2026-06-04",
    times: ["19:00", "21:30"],
    venueId: "lichtblick",
    title: l("Opening night", "Serata inaugurale", "Eröffnungsabend"),
  },
  {
    id: "2026-friday",
    date: "2026-06-05",
    times: ["18:30", "21:30"],
    venueId: "il-kino",
    title: l(
      "Official screenings",
      "Proiezioni ufficiali",
      "Offizielle Vorführungen",
    ),
  },
  {
    id: "2026-saturday",
    date: "2026-06-06",
    times: ["19:00"],
    venueId: "acud",
    title: l(
      "Official screenings",
      "Proiezioni ufficiali",
      "Offizielle Vorführungen",
    ),
  },
  {
    id: "2026-closing",
    date: "2026-06-07",
    times: ["19:00"],
    venueId: "acud",
    title: l("Awards night", "Serata dei premi", "Preisverleihung"),
  },
].map((entry, i) => ({
  ...entry,
  edition: 2026,
  status: published,
  source: schedule,
  filmIds: blocks[i].map((f) => f.id),
}));

const festival: Festival = {
  editions: [
    {
      id: "2027",
      year: 2027,
      label: l(
        "June 2027 · Berlin",
        "Giugno 2027 · Berlino",
        "Juni 2027 · Berlin",
      ),
      status: published,
    },
    {
      id: "2026",
      year: 2026,
      label: l(
        "4–7 June 2026 · Berlin",
        "4–7 giugno 2026 · Berlino",
        "4.–7. Juni 2026 · Berlin",
      ),
      starts: "2026-06-04",
      ends: "2026-06-07",
      status: published,
      source: experience,
    },
  ],
  films: blocks.flat(),
  screenings,
  events,
  venues: [
    {
      id: "lichtblick",
      name: "Lichtblick Kino",
      edition: 2026,
      status: published,
      source: experience,
      map: "https://www.google.com/maps/search/?api=1&query=Lichtblick+Kino+Berlin",
    },
    {
      id: "il-kino",
      name: "IL KINO",
      edition: 2026,
      status: published,
      source: experience,
      map: "https://www.google.com/maps/search/?api=1&query=IL+KINO+Berlin",
    },
    {
      id: "acud",
      name: "ACUD Kino",
      edition: 2026,
      status: published,
      source: experience,
      map: "https://www.google.com/maps/search/?api=1&query=ACUD+Kino+Berlin",
    },
  ],
  awards: [
    {
      id: "film",
      title: l("Best Film", "Miglior film", "Bester Film"),
      recipient: "Giulia Grandinetti",
      filmId: "majoneze",
    },
    {
      id: "director",
      title: l("Best Director", "Miglior regia", "Beste Regie"),
      recipient: "Paoli De Luca",
      filmId: "marina",
    },
    {
      id: "actress",
      title: l("Best Actress", "Migliore attrice", "Beste Darstellerin"),
      recipient: "Carlotta Gamba",
    },
    {
      id: "actor",
      title: l("Best Actor", "Miglior attore", "Bester Darsteller"),
      recipient: "Giovanni Crozza Signoris",
    },
    {
      id: "audience",
      title: l(
        "MYmovies ONE Audience Award",
        "Premio del pubblico MYmovies ONE",
        "Publikumspreis von MYmovies ONE",
      ),
      recipient: "Alessandro Capitani",
      filmId: "bellissima",
    },
    {
      id: "lifetime",
      title: l(
        "Lifetime Achievement Award",
        "Premio alla carriera",
        "Preis für das Lebenswerk",
      ),
      recipient: "Valentina Lodovini",
    },
    {
      id: "guests",
      title: l(
        "Special Guest Awards",
        "Premi ospiti speciali",
        "Ehrengastpreise",
      ),
      recipient: "Sara Serraiocco, Antonio Bannò",
    },
  ].map((a) => ({
    ...a,
    edition: 2026,
    status: published,
    source: experience,
  })),
  people: [
    {
      id: "patron",
      name: "Valentina Lodovini",
      role: l(
        "2026 festival patron",
        "Madrina del festival 2026",
        "Schirmherrin des Festivals 2026",
      ),
      status: published,
      source: experience,
    },
  ],
  partners: [
    {
      id: "taxidrivers",
      name: "TaxiDrivers",
      edition: 2026,
      status: published,
      url: "https://www.taxidrivers.it/italy-short-film-days",
    },
  ],
  articles: [
    {
      id: "programme",
      title: l(
        "The first festival programme",
        "Il programma della prima edizione",
        "Das Programm der ersten Festivalausgabe",
      ),
      summary: l(
        "TaxiDrivers on four days of screenings across three independent cinemas.",
        "TaxiDrivers racconta quattro giorni di proiezioni in tre cinema indipendenti.",
        "TaxiDrivers berichtet über vier Tage mit Filmvorführungen in drei unabhängigen Kinos.",
      ),
      url: press,
      kind: "press",
      status: published,
    },
    {
      id: "retrospective",
      title: l(
        "A look back at the first edition",
        "Uno sguardo alla prima edizione",
        "Rückblick auf die erste Festivalausgabe",
      ),
      summary: l(
        "The festival’s recap of screenings, guests and awards.",
        "Il riepilogo del festival con proiezioni, ospiti e premi.",
        "Der Festivalrückblick auf Vorführungen, Gäste und Preise.",
      ),
      url: experience,
      kind: "editorial",
      status: published,
    },
    {
      id: "ciao",
      title: l(
        "Carlotta Gamba and Ciao Varsavia",
        "Carlotta Gamba e Ciao Varsavia",
        "Carlotta Gamba und Ciao Varsavia",
      ),
      summary: l(
        "TaxiDrivers covers the actor’s festival appearance.",
        "TaxiDrivers racconta la partecipazione dell’attrice al festival.",
        "TaxiDrivers berichtet über den Festivalauftritt der Schauspielerin.",
      ),
      url: "https://www.taxidrivers.it/533202/italy-short-film-days/carlotta-gamba-allitaly-short-film-days-berlin-con-il-corto-ciao-varsavia.html",
      kind: "news",
      status: published,
    },
  ],
  tickets: [],
  workshops: [],
  podcasts: [],
};
export const repository: FestivalRepository = {
  async getFestival() {
    return festival;
  },
};
