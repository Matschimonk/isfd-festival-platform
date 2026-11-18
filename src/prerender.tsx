import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { repository } from "./archive";
import { defaultLocale, locales, type Locale } from "./content";
import {
  link,
  origin,
  publishedRoutes,
  resolvePage,
  type Route,
} from "./routes";
import { alternates, escapeMarkup, renderHead } from "./seo";

const output = "dist";
const templatePath = join(output, "index.html");
const template = await readFile(templatePath, "utf8");
const data = await repository.getFestival();
const routes = publishedRoutes(data);
const rootMarker = '<div id="root"></div>';
const headMarker = /<!-- page-head:start -->[\s\S]*?<!-- page-head:end -->/;

if (!template.includes(rootMarker) || !headMarker.test(template)) {
  throw new Error("Missing prerender template markers.");
}

async function writePage(route: Route, locale: Locale, filename: string) {
  const content = renderToString(
    <App data={data} route={route} locale={locale} />,
  );
  const html = template
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace(headMarker, () => renderHead(data, route, locale))
    .replace(rootMarker, () => `<div id="root">${content}</div>`);
  await mkdir(dirname(filename), { recursive: true });
  await writeFile(filename, html);
}

const entries: string[] = [];
for (const route of routes) {
  const inSitemap = !resolvePage(data, route).story?.demo;
  const links = alternates(route)
    .map(
      ({ locale, url }) =>
        `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeMarkup(url)}"/>`,
    )
    .join("");
  for (const locale of locales) {
    const pathname = link(locale, route.page, route.id);
    await writePage(
      route,
      locale,
      join(output, pathname.slice(1), "index.html"),
    );
    if (inSitemap)
      entries.push(
        `  <url><loc>${escapeMarkup(origin + pathname)}</loc>${links}</url>`,
      );
  }
}
// The root serves the English homepage and declares /en/ as its canonical URL.
await writePage({ page: "home" }, defaultLocale, templatePath);
await writeFile(
  join(output, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`,
);
console.log(
  `Prerendered ${routes.length * locales.length} canonical pages and the root homepage. Wrote ${entries.length} URLs to dist/sitemap.xml.`,
);
