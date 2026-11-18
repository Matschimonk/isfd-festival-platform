import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource-variable/inter/wght.css";
import { App } from "./App";
import { repository } from "./archive";
import { defaultLocale, isLocale } from "./content";
import { ui } from "./copy";
import { legacyRoute, link, pathRoute, resolvePage } from "./routes";
import { pageMetadata } from "./seo";
import "./style.css";
import "./experience-v2.css";
import "./director-preview.css";
import "./programme-timetable.css";
import "./editorial-cinema.css";

function savedLocale() {
  try {
    const saved = localStorage.getItem("festival-locale");
    if (isLocale(saved)) return saved;
  } catch {
    // Preferences are optional when browser storage is unavailable.
  }
  return defaultLocale;
}

async function start() {
  const root = document.getElementById("root")!;
  const params = new URLSearchParams(location.search);
  const atRoot =
    location.pathname === "/" || location.pathname === "/index.html";
  const requested = atRoot
    ? legacyRoute(params, savedLocale())
    : (pathRoute(location.pathname) ?? { locale: savedLocale(), route: null });
  const { locale, route } = requested;
  const data = await repository.getFestival();
  const { missing } = resolvePage(data, route);
  if (
    atRoot &&
    !missing &&
    route &&
    (params.has("page") ||
      params.has("id") ||
      isLocale(params.get("lang")) ||
      locale !== defaultLocale)
  ) {
    const destination = new URL(
      link(locale, route.page, route.id),
      location.origin,
    );
    params.delete("page");
    params.delete("id");
    params.delete("lang");
    destination.search = params.toString();
    destination.hash = location.hash;
    location.replace(destination);
    return;
  }

  try {
    localStorage.setItem("festival-locale", locale);
  } catch {
    // The current language remains available through the URL.
  }
  const element = <App data={data} route={route} locale={locale} />;
  if (!missing && root.hasChildNodes()) {
    hydrateRoot(root, element);
  } else {
    document.documentElement.lang = locale;
    const metadata = pageMetadata(data, route, locale);
    document.title = metadata.title;
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", metadata.robots);
    createRoot(root).render(element);
  }
}

void start().catch(() => {
  // Retain the static document if hydration is unavailable.
  const root = document.getElementById("root")!;
  if (!root.hasChildNodes()) {
    const locale =
      pathRoute(location.pathname)?.locale ??
      legacyRoute(new URLSearchParams(location.search), savedLocale()).locale;
    document.documentElement.lang = locale;
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = ui.error[locale];
    root.append(message);
  }
});
