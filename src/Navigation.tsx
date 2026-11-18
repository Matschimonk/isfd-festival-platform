import { useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import {
  l,
  localeNames,
  locales,
  type Locale,
  type LocalizedContent,
} from "./content";
import { pages, ui } from "./copy";
import { link, type Page } from "./routes";

type NavItem = { label: LocalizedContent; page: Page; anchor?: string };
const primary: NavItem[] = [
  { label: l("Discover", "Scopri", "Entdecken"), page: "home" },
  {
    label: l("Films & Events", "Film ed eventi", "Filme & Events"),
    page: "films",
  },
  {
    label: l("People & Stories", "Persone e storie", "Menschen & Geschichten"),
    page: "academy",
  },
  {
    label: l("Beyond Cinema", "Oltre il cinema", "Jenseits des Kinos"),
    page: "programme",
    anchor: "#social",
  },
];
const secondary: NavItem[] = [
  { label: l("About", "Chi siamo", "Über uns"), page: "festival" },
  { label: pages.archive, page: "archive" },
  {
    label: l("Partners", "Partner", "Partner"),
    page: "festival",
    anchor: "#partners",
  },
  { label: l("Visit", "Visita", "Besuch"), page: "venues" },
  { label: l("Press", "Stampa", "Presse"), page: "media" },
];
const secondaryLabel = l(
  "Festival information",
  "Informazioni sul festival",
  "Festivalinformationen",
);

export function Brand({ locale }: { locale: Locale }) {
  return (
    <a className="brand" href={link(locale)}>
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

export function Header({
  locale,
  page,
  id,
  missing,
}: {
  locale: Locale;
  page: Page;
  id?: string;
  missing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  function nav(items: NavItem[]) {
    return items.map(({ page: target, label, anchor }) => (
      <a
        key={target + (anchor ?? "")}
        href={link(locale, target) + (anchor ?? "")}
        aria-current={
          !missing && !anchor && target === page ? "page" : undefined
        }
        onClick={() => setOpen(false)}
      >
        {label[locale]}
      </a>
    ));
  }
  return (
    <header
      className="header festival-header"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="shell header-inner">
        <Brand locale={locale} />
        <div className="header-tools">
          <a
            className="ticket-cta"
            href={link(locale, "tickets")}
            aria-current={page === "tickets" && !missing ? "page" : undefined}
          >
            {pages.tickets[locale]}{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            className="menu-toggle"
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="site-links"
            onClick={() => setOpen(!open)}
            aria-label={ui.menu[locale]}
          >
            {open ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
          <div
            className="languages"
            role="group"
            aria-label={ui.language[locale]}
          >
            {locales.map((lang) => (
              <a
                key={lang}
                href={missing ? link(lang) : link(lang, page, id)}
                lang={lang}
                aria-label={localeNames[lang]}
                aria-current={locale === lang ? "true" : undefined}
              >
                {lang.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
        <div id="site-links" className={open ? "nav-open" : undefined}>
          <nav id="main-nav" aria-label={ui.nav[locale]}>
            {nav(primary)}
          </nav>
          <nav className="secondary-nav" aria-label={secondaryLabel[locale]}>
            {nav(secondary)}
          </nav>
        </div>
      </div>
    </header>
  );
}
