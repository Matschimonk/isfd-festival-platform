import { mkdir, writeFile } from "node:fs/promises";
import { defineConfig } from "vite";
import { repository } from "./src/archive";
import { locales, visible, type Locale } from "./src/content";
import { pages } from "./src/copy";

const origin = "https://italyshortfilmdays2027.rawdrivers.org/";
const xml = (value: string) => value.replaceAll("&", "&amp;");

export default defineConfig({
  base: "/",
  plugins: [
    {
      name: "festival-sitemap",
      apply: "build",
      async closeBundle() {
        const data = await repository.getFestival();
        const routes = [
          ...Object.keys(pages).map((page) => ({ page, id: undefined })),
          ...data.films
            .filter(visible)
            .map(({ id }) => ({ page: "films", id })),
          ...data.venues
            .filter(visible)
            .map(({ id }) => ({ page: "venues", id })),
        ];
        const href = (
          { page, id }: (typeof routes)[number],
          locale: Locale,
        ) => {
          const url = new URL(origin);
          if (page !== "home") url.searchParams.set("page", page);
          if (id) url.searchParams.set("id", id);
          url.searchParams.set("lang", locale);
          return xml(url.href);
        };
        const entries = routes.flatMap((route) =>
          locales.map((locale) => {
            const alternatives = locales
              .map(
                (lang) =>
                  `<xhtml:link rel="alternate" hreflang="${lang}" href="${href(route, lang)}"/>`,
              )
              .join("");
            return `  <url><loc>${href(route, locale)}</loc>${alternatives}</url>`;
          }),
        );
        await mkdir("seo", { recursive: true });
        await writeFile(
          "seo/sitemap.xml",
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`,
        );
      },
    },
  ],
});
