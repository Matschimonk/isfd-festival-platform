import {
  defaultLocale,
  isLocale,
  visible,
  type EditorialStatus,
  type Festival,
  type Locale,
} from "./content";
import { pages } from "./copy";

function siteOrigin(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_SITE_ORIGIN must be a bare HTTPS origin.");
  }
  return url.origin;
}

export const origin = siteOrigin(
  import.meta.env.VITE_SITE_ORIGIN ?? "https://italyshortfilmdays2027.rawdrivers.org",
);
export type Page = keyof typeof pages;
export type Route = { page: Page; id?: string };
const home: Route = { page: "home" };
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isPage = (value: string): value is Page => Object.hasOwn(pages, value);

export function link(locale: Locale, page: Page = "home", id?: string) {
  return `/${locale}/${page === "home" ? "" : page + "/"}${id ? id + "/" : ""}`;
}

export function pathRoute(pathname: string) {
  const path = pathname.replace(/\/index\.html$/, "/").replace(/\/?$/, "/");
  const [lang, section = "home", id, ...rest] = path.slice(1, -1).split("/");
  if (
    !isLocale(lang) ||
    !isPage(section) ||
    rest.length ||
    (id !== undefined && !slug.test(id)) ||
    link(lang, section, id) !== path
  )
    return;
  return { locale: lang, route: { page: section, id } };
}

export function legacyRoute(params: URLSearchParams, preferred: Locale) {
  const requested = params.get("lang");
  const locale = isLocale(requested) ? requested : preferred;
  const section = params.get("page") ?? "home";
  const id = params.get("id");
  const route =
    isPage(section) && (id === null || slug.test(id))
      ? { page: section, id: id ?? undefined }
      : null;
  return { locale, route };
}

export function publishedRoutes(data: Festival): Route[] {
  const routes: Route[] = [
    ...(Object.keys(pages) as Page[]).map((page) => ({ page })),
    ...data.films
      .filter(visible)
      .map(({ id }) => ({ page: "films" as const, id })),
    ...data.events
      .filter(visible)
      .map(({ id }) => ({ page: "programme" as const, id })),
    ...data.venues
      .filter(visible)
      .map(({ id }) => ({ page: "venues" as const, id })),
    ...data.articles
      .filter(visible)
      .map(({ id }) => ({ page: "media" as const, id })),
  ];
  const seen = new Set<string>();
  for (const { page, id } of routes) {
    const path = link(defaultLocale, page, id);
    if ((id !== undefined && !slug.test(id)) || seen.has(path)) {
      throw new Error(`Unsafe or duplicate published route: ${path}`);
    }
    seen.add(path);
  }
  return routes;
}

export function resolvePage(data: Festival, route: Route | null) {
  const { page, id } = route ?? home;
  const published = <T extends { id: string; status: EditorialStatus }>(
    records: T[],
  ) => records.find((record) => record.id === id && visible(record));
  const film = id && page === "films" ? published(data.films) : undefined;
  const event = id && page === "programme" ? published(data.events) : undefined;
  const venue = id && page === "venues" ? published(data.venues) : undefined;
  const article = id && page === "media" ? published(data.articles) : undefined;
  return {
    page,
    id,
    film,
    event,
    venue,
    article,
    missing: !route || Boolean(id && !film && !event && !venue && !article),
  };
}
