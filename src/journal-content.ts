import { l, type JournalStory } from "./content";

export const journalCategories = {
  interviews: l("Interviews", "Interviste", "Interviews"),
  festival: l("Festival Stories", "Storie dal festival", "Festivalgeschichten"),
  backstage: l("Behind the Screen", "Dietro lo schermo", "Hinter der Leinwand"),
  perspectives: l("Perspectives", "Prospettive", "Perspektiven"),
};

export const journalCopy = {
  metaTitle: l(
    "Journal · Italian short cinema",
    "Magazine · Cinema breve italiano",
    "Journal · Italienischer Kurzfilm",
  ),
  intro: l(
    "Notes on short cinema, the people who make it and the city that brings us together.",
    "Appunti sul cinema breve, su chi lo fa e sulla città che ci fa incontrare.",
    "Notizen zum Kurzfilm, zu den Menschen dahinter und zu der Stadt, die uns zusammenbringt.",
  ),
  demo: l("Editorial demo", "Prototipo editoriale", "Redaktionelle Vorschau"),
  demoNote: l(
    "Editorial preview. The archive links lead to source material from 2026.",
    "Anteprima editoriale. I collegamenti all’archivio rimandano alle fonti del 2026.",
    "Redaktionelle Vorschau. Die Archivlinks führen zu Quellen aus dem Jahr 2026.",
  ),
  author: l(
    "Preview editorial team",
    "Redazione dell’anteprima",
    "Vorschauredaktion",
  ),
  by: l("By", "Di", "Von"),
  previewDate: l("Preview date", "Data dell’anteprima", "Datum der Vorschau"),
  all: l("All stories", "Tutte le storie", "Alle Beiträge"),
  stories: l(
    "Selected stories",
    "Storie in primo piano",
    "Ausgewählte Beiträge",
  ),
  read: l("Read story", "Leggi", "Beitrag lesen"),
  open: l("Explore the journal", "Esplora il magazine", "Journal entdecken"),
  previous: l("Previous story", "Storia precedente", "Vorheriger Beitrag"),
  next: l("Next story", "Storia successiva", "Nächster Beitrag"),
  related: l("Related reading", "Per approfondire", "Weiterlesen"),
  film: l("Film notes", "Scheda del film", "Zum Film"),
  event: l("Related event", "Evento collegato", "Passender Programmpunkt"),
  artwork: l(
    "ISFD preview artwork",
    "Grafica dell’anteprima ISFD",
    "ISFD-Motiv der Vorschau",
  ),
};

const demo = {
  status: "published",
  demo: true,
  date: "2026-11-18",
  author: journalCopy.author,
} as const;

export const journal: JournalStory[] = [
  {
    ...demo,
    id: "after-the-lights",
    category: "festival",
    featured: true,
    title: l(
      "After the lights come up",
      "Quando si riaccendono le luci",
      "Wenn das Licht wieder angeht",
    ),
    subtitle: l(
      "A way back into the first edition, through the films and the conversations a screening can start.",
      "Un modo per tornare alla prima edizione, attraverso i film e le conversazioni che possono nascere dopo una proiezione.",
      "Ein Weg zurück zur ersten Ausgabe, über die Filme und die Gespräche, die eine Vorführung anstoßen kann.",
    ),
    body: [
      l(
        "A film can be over in minutes and stay with you for days. A roomful of people has just watched the same images, yet each person carries something different out of the cinema. It might be a gesture, a line, or the sudden shift in sound that made the room go quiet.",
        "Un film può finire in pochi minuti e accompagnarci per giorni. In sala abbiamo appena visto le stesse immagini, eppure ognuno porta via qualcosa di diverso. Forse un gesto, una battuta o un cambio improvviso nel suono che ha fatto calare il silenzio.",
        "Ein Film kann nach wenigen Minuten vorbei sein und uns noch tagelang begleiten. Im Saal haben alle dieselben Bilder gesehen, und doch nimmt jeder Mensch etwas anderes mit. Vielleicht eine Geste, einen Satz oder den jähen Wechsel im Ton, bei dem es im Raum still wurde.",
      ),
      l(
        "The 2026 archive gives those impressions somewhere to land. Start with a film that stayed with you, then look at the programme it belonged to. The titles around it offer another way to remember the evening and a place to start exploring if you missed it.",
        "L’archivio del 2026 offre un punto di partenza a queste impressioni. Parti da un film che ti è rimasto in mente, poi ritrova il programma in cui era inserito. I titoli che lo affiancavano aiutano a ricordare la serata, o a scoprirla se non c’eri.",
        "Im Archiv von 2026 können solche Eindrücke einen Platz finden. Fang mit einem Film an, der dir im Gedächtnis geblieben ist, und sieh dir das Programm an, in dem er lief. Die anderen Titel helfen dir, dich an den Abend zu erinnern oder ihn im Nachhinein zu entdecken.",
      ),
      l(
        "That is the idea behind this journal. Alongside the timetable, which helps us decide where to go, there is space to return to a film, follow a question and keep the conversation going.",
        "Da qui nasce l’idea del magazine. Accanto al programma, che ci aiuta a decidere dove andare, c’è spazio per tornare a un film, seguire una domanda e continuare a parlarne.",
        "So ist die Idee für dieses Journal entstanden. Neben dem Zeitplan, der bei der Entscheidung hilft, wohin es geht, bleibt Platz, um zu einem Film zurückzukehren, einer Frage nachzugehen und das Gespräch fortzusetzen.",
      ),
    ],
    pullQuote: l(
      "A film can be over in minutes and stay with you for days.",
      "Un film può finire in pochi minuti e accompagnarci per giorni.",
      "Ein Film kann nach wenigen Minuten vorbei sein und uns noch tagelang begleiten.",
    ),
    filmId: "bellissima",
    reading: {
      page: "archive",
      label: l(
        "Explore the 2026 archive",
        "Esplora l’archivio 2026",
        "Das Archiv 2026 entdecken",
      ),
    },
  },
  {
    ...demo,
    id: "before-the-first-question",
    category: "interviews",
    title: l(
      "Before the first question",
      "Prima della prima domanda",
      "Vor der ersten Frage",
    ),
    subtitle: l(
      "How we’d make room for the filmmaker’s voice.",
      "Come dare spazio alla voce di chi fa cinema.",
      "Wie die Stimmen der Filmschaffenden Raum bekommen sollen.",
    ),
    body: [
      l(
        "A good festival interview begins with watching closely. Notice what a face, a cut, or a silence is doing in the film. The first question can come from that small detail instead of asking a filmmaker to sum up their work.",
        "Una buona intervista da festival comincia guardando con attenzione. Che cosa fa un volto, un taglio o un silenzio dentro il film? Da quel dettaglio può nascere la prima domanda, senza chiedere subito a chi ha fatto il film di riassumere il proprio lavoro.",
        "Ein gutes Festivalinterview beginnt mit genauem Hinsehen. Was bewirken ein Gesicht, ein Schnitt oder ein Moment der Stille? Aus einem solchen Detail kann die erste Frage entstehen, ohne dass jemand gleich die ganze Arbeit zusammenfassen muss.",
      ),
      l(
        "This preview describes our approach to future interviews. For a published account of the first edition, follow the existing press coverage of Carlotta Gamba and Ciao Varsavia in the Media Hub.",
        "Questa anteprima racconta come vorremmo costruire le prossime interviste. Per una testimonianza pubblicata sulla prima edizione, nella sezione Multimedia trovi il servizio su Carlotta Gamba e Ciao Varsavia.",
        "Diese Vorschau skizziert unseren Ansatz für künftige Interviews. Einen veröffentlichten Beitrag zur ersten Ausgabe findest du in der Mediathek, über Carlotta Gamba und Ciao Varsavia.",
      ),
    ],
    filmId: "ciao-varsavia",
    reading: {
      page: "media",
      id: "ciao",
      label: l(
        "Read the 2026 press coverage",
        "Leggi il servizio del 2026",
        "Den Pressebeitrag von 2026 lesen",
      ),
    },
  },
  {
    ...demo,
    id: "what-the-cut-leaves-out",
    category: "backstage",
    title: l(
      "What the cut leaves out",
      "Ciò che resta fuori dal montaggio",
      "Was der Schnitt weglässt",
    ),
    subtitle: l(
      "An editorial note on the work a short film leaves off-screen.",
      "Una nota sul lavoro che in un corto resta fuori campo.",
      "Eine redaktionelle Notiz über die Arbeit jenseits des Bildes.",
    ),
    body: [
      l(
        "A short film creates its own sense of scale. A repeated sound can suggest an entire place. An object can carry information that a longer scene might have explained. Those decisions are worth looking for on a second viewing.",
        "Un cortometraggio crea una propria idea di scala. Un suono che ritorna può evocare un luogo intero. Un oggetto può comunicare ciò che una scena più lunga avrebbe spiegato. Vale la pena cercare queste scelte a una seconda visione.",
        "Ein Kurzfilm schafft seinen eigenen Maßstab. Ein wiederkehrender Ton kann einen ganzen Ort andeuten. Ein Gegenstand kann vermitteln, wofür eine längere Szene mehr Zeit bräuchte. Beim zweiten Sehen lohnt es sich, auf solche Entscheidungen zu achten.",
      ),
      l(
        "The Behind the Screen section is intended for documented conversations about craft and production. Until there is a cleared interview or image, it can offer a question to take back to the film: what did we learn without being told?",
        "Dietro lo schermo è pensato per conversazioni documentate sul mestiere e sulla produzione. In attesa di un’intervista o di immagini autorizzate, resta una domanda da riportare al film: cosa abbiamo capito senza che ci venisse spiegato?",
        "Hinter der Leinwand ist für belegte Gespräche über das Handwerk und die Produktion gedacht. Bis ein Interview oder Bild freigegeben ist, führt eine Frage zurück zum Film: Was haben wir verstanden, ohne dass es uns erklärt wurde?",
      ),
    ],
    filmId: "playing-god",
  },
  {
    ...demo,
    id: "short-is-a-form",
    category: "perspectives",
    title: l("Short is a form", "Il corto è una forma", "Kurz ist eine Form"),
    subtitle: l(
      "Reading a festival programme one film at a time.",
      "Leggere il programma di un festival, un film alla volta.",
      "Ein Festivalprogramm Film für Film lesen.",
    ),
    body: [
      l(
        "Duration changes how we listen and look. A few minutes can hold a single encounter, or open up a world we only glimpse. A short-film programme creates another rhythm by putting those different ways of seeing next to each other.",
        "La durata cambia il modo di guardare e ascoltare. Pochi minuti possono racchiudere un incontro o aprire uno spiraglio su un mondo. Un programma di cortometraggi crea un altro ritmo accostando questi modi diversi di vedere.",
        "Die Dauer verändert, wie wir zuhören und hinsehen. Wenige Minuten können eine einzige Begegnung fassen oder den Blick in eine Welt öffnen, die wir nur kurz sehen. Ein Kurzfilmprogramm gewinnt seinen eigenen Rhythmus, wenn es solche unterschiedlichen Blicke nebeneinanderstellt.",
      ),
      l(
        "The 2026 programme is a good place to try this kind of reading. Pick a title, then trace it back to its screening block. The archive preserves the relationships between films that the original audience encountered together.",
        "Il programma del 2026 è un buon punto di partenza. Scegli un titolo, poi risali al blocco in cui è stato proiettato. L’archivio conserva gli accostamenti fra i film che il pubblico ha visto insieme.",
        "Das Programm von 2026 bietet einen guten Einstieg. Wähle einen Titel und suche den Vorführungsblock, in dem er lief. Das Archiv bewahrt die Zusammenstellung der Filme, die das Publikum gemeinsam gesehen hat.",
      ),
    ],
    filmId: "majoneze",
    reading: {
      page: "archive",
      anchor: "archive-screenings",
      label: l(
        "See the 2026 screening blocks",
        "Scopri i blocchi del 2026",
        "Die Vorführungsblöcke 2026 ansehen",
      ),
    },
  },
];
