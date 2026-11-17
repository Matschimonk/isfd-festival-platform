export type Locale = "en" | "it";
export type Localized = Record<Locale, string>;
export type Film = {
  id: string;
  title: string;
  director: string;
  year: number;
  stillUrl: string;
  minutes: number;
  synopsis: Localized;
};
export type Section = {
  id: "programme" | "venues" | "tickets" | "afterparty";
  title: Localized;
  body: Localized;
};
export type Festival = {
  collections: { id: string; title: Localized; filmIds: string[] }[];
  films: Film[];
  sections: Section[];
};
export interface FestivalRepository {
  getFestival(): Promise<Festival>;
}
const l = (en: string, it: string): Localized => ({ en, it });
const still = (id: string) => `${import.meta.env.BASE_URL}images/${id}.webp`;
const festival: Festival = {
  films: [
    {
      id: "acqua",
      title: "Sott’acqua",
      director: "Giulia Moretti",
      year: 2026,
      stillUrl: still("acqua"),
      minutes: 14,
      synopsis: l(
        "A swimmer returns to an empty pool where the water holds a memory she cannot leave behind.",
        "Una nuotatrice torna in una piscina vuota, dove l’acqua custodisce un ricordo che non riesce a lasciarsi alle spalle.",
      ),
    },
    {
      id: "sole",
      title: "Dove cade il sole",
      director: "Luca Ferraro",
      year: 2026,
      stillUrl: still("sole"),
      minutes: 18,
      synopsis: l(
        "Two sisters walk across a Sicilian field on the last day of summer.",
        "Due sorelle attraversano un campo siciliano nell’ultimo giorno d’estate.",
      ),
    },
    {
      id: "blu",
      title: "L’ora blu",
      director: "Marta Rinaldi",
      year: 2027,
      stillUrl: still("blu"),
      minutes: 12,
      synopsis: l(
        "At dusk, a young man waits in the doorway of his childhood home.",
        "Al crepuscolo, un giovane aspetta sulla soglia della casa della sua infanzia.",
      ),
    },
    {
      id: "resta",
      title: "Quello che resta",
      director: "Elena Vitale",
      year: 2026,
      stillUrl: still("resta"),
      minutes: 21,
      synopsis: l(
        "One unanswered phone call changes the rhythm of a quiet afternoon.",
        "Una telefonata senza risposta cambia il ritmo di un pomeriggio tranquillo.",
      ),
    },
    {
      id: "binario",
      title: "Ultimo binario",
      director: "Paolo Serra",
      year: 2027,
      stillUrl: still("binario"),
      minutes: 16,
      synopsis: l(
        "A passenger waits for the last train in a station that seems suspended in time.",
        "Un passeggero aspetta l’ultimo treno in una stazione che sembra sospesa nel tempo.",
      ),
    },
    {
      id: "notte",
      title: "La notte addosso",
      director: "Sara Leone",
      year: 2027,
      stillUrl: still("notte"),
      minutes: 11,
      synopsis: l(
        "Two strangers move through a crowded club as the night begins to come apart.",
        "Due sconosciuti si muovono in un club affollato mentre la notte comincia a dissolversi.",
      ),
    },
  ],
  collections: [
    {
      id: "selection",
      title: l("Official Selection", "Selezione ufficiale"),
      filmIds: ["acqua", "sole", "blu", "resta", "binario", "notte"],
    },
    {
      id: "after-dark",
      title: l("After Dark", "Dopo il tramonto"),
      filmIds: ["notte", "binario", "resta", "blu", "acqua"],
    },
  ],
  sections: [
    {
      id: "programme",
      title: l("Programme", "Programma"),
      body: l(
        "12 November · Opening screening\n13 November · Official Selection and filmmaker Q&A\n14 November · After Dark and closing screening",
        "12 novembre · Proiezione inaugurale\n13 novembre · Selezione ufficiale e incontro con gli autori\n14 novembre · Dopo il tramonto e proiezione di chiusura",
      ),
    },
    {
      id: "venues",
      title: l("Venues", "Sedi"),
      body: l(
        "Preview venue · Kino International, Karl-Marx-Allee 33, Berlin. Venue details are provisional.",
        "Sede indicativa · Kino International, Karl-Marx-Allee 33, Berlino. I dettagli sono provvisori.",
      ),
    },
    {
      id: "tickets",
      title: l("Tickets", "Biglietti"),
      body: l(
        "Ticket sales are closed. Festival passes and single screening tickets are planned for the 2027 edition.",
        "Le vendite sono chiuse. Per l’edizione 2027 sono previsti abbonamenti e biglietti per singole proiezioni.",
      ),
    },
    {
      id: "afterparty",
      title: l("Afterparty", "Festa finale"),
      body: l(
        "14 November · A closing night gathering with music and filmmakers. Venue and time to be announced.",
        "14 novembre · Una serata conclusiva con musica e autori. Luogo e orario da annunciare.",
      ),
    },
  ],
};
export const repository: FestivalRepository = {
  async getFestival() {
    return festival;
  },
};
export const copy = {
  en: {
    films: "Films",
    programme: "Programme",
    venues: "Venues",
    tickets: "Tickets",
    afterparty: "Afterparty",
    date: "12–14 NOVEMBER 2027",
    city: "BERLIN, GERMANY",
    intro:
      "Three days of contemporary Italian short cinema.\nNew voices, bold visions, after dark in Berlin.",
    explore: "Explore films",
    schedule: "View programme",
    lineup: "THE LINEUP",
    previous: "Previous films",
    next: "Next films",
    close: "Close preview",
    directed: "Directed by",
    mock: "Festival preview · Programme and film details are illustrative.",
    top: "Back to top",
    error: "Festival content is temporarily unavailable.",
  },
  it: {
    films: "Film",
    programme: "Programma",
    venues: "Sedi",
    tickets: "Biglietti",
    afterparty: "Festa finale",
    date: "12–14 NOVEMBRE 2027",
    city: "BERLINO, GERMANIA",
    intro:
      "Tre giorni di cortometraggi italiani contemporanei.\nNuove voci, visioni audaci, dopo il tramonto a Berlino.",
    explore: "Esplora i film",
    schedule: "Vedi il programma",
    lineup: "I FILM",
    previous: "Film precedenti",
    next: "Film successivi",
    close: "Chiudi anteprima",
    directed: "Regia di",
    mock: "Anteprima del festival · Programma e dettagli dei film sono a scopo illustrativo.",
    top: "Torna in alto",
    error: "I contenuti del festival sono temporaneamente indisponibili.",
  },
};
