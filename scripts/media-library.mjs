// Only approved records projected here can reach the client or the static build.
import { readFileSync, realpathSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const locales = ["en", "it", "de"];
const formats = {
  image: /\.(?:webp|avif|jpe?g|png)$/i,
  video: /\.(?:mp4|webm)$/i,
  audio: /\.(?:mp3|m4a|ogg)$/i,
  captions: /\.vtt$/i,
};
const roles = {
  poster: ["image"],
  still: ["image"],
  portrait: ["image"],
  preview: ["video"],
  interview: ["video", "audio"],
  podcast: ["audio", "video"],
  workshop: ["image", "video", "audio"],
  archive: ["image", "video", "audio"],
};
const kinds = [
  "featured",
  "gallery",
  "clips",
  "aftermovie",
  "interviews",
  "screenings",
  "awards",
  "backstage",
  "press",
];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const nonempty = (value) =>
  typeof value === "string" && value.trim().length > 0;
const positive = (value) => Number.isInteger(value) && value > 0;
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

export function loadMedia(records, festival, dir) {
  if (!Array.isArray(records))
    throw new Error("Media manifest must be an array.");
  const errors = [],
    assets = [],
    files = new Map(),
    seen = new Set();
  const published = (items) =>
    items.filter((item) => item.status === "published").map((item) => item.id);
  const relationships = {
    films: published(festival.films),
    guests: [
      ...published(festival.people),
      ...festival.awards
        .filter(
          (item) =>
            item.status === "published" &&
            ["actor", "actress", "director"].includes(item.id),
        )
        .map((item) => "award-" + item.id),
    ],
    events: [
      ...published(festival.events),
      ...published(festival.workshops),
      ...published(festival.screenings),
    ],
    venues: published(festival.venues),
  };
  const editions = new Set(
    festival.editions
      .filter((item) => item.status === "published")
      .map((item) => item.year),
  );

  records.forEach((record, i) => {
    const error = (message) =>
      errors.push(
        `Record ${i + 1}${typeof record?.id === "string" ? " (" + record.id + ")" : ""}: ${message}`,
      );
    const start = errors.length;
    if (!object(record)) {
      error("Expected an object.");
      return;
    }
    const live = record.status === "published" && record.rights === "approved";
    function text(value, field) {
      if (!nonempty(value)) error(`${field} is required.`);
      return value;
    }
    function localized(value, field) {
      for (const locale of locales) text(value?.[locale], `${field}.${locale}`);
      return Object.fromEntries(
        locales.map((locale) => [locale, value?.[locale]]),
      );
    }
    function https(value, field) {
      try {
        if (
          !nonempty(value) ||
          value.trim() !== value ||
          !value.startsWith("https://")
        )
          throw new Error();
        const url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password)
          throw new Error();
        return url;
      } catch {
        error(`${field} must be a valid HTTPS URL without credentials.`);
      }
    }
    function media(value, field, type) {
      if (typeof value === "string" && value.startsWith("local:")) {
        const name = value.slice(6);
        if (type !== "image" || !/^[a-zA-Z0-9_-]+\.webp$/.test(name)) {
          error(`${field}: local files must be flat WebP images.`);
          return;
        }
        const path = resolve(dir, name);
        try {
          if (realpathSync(path) !== path || !statSync(path).isFile())
            throw new Error();
          const data = readFileSync(path);
          if (
            data.length < 16 ||
            data.toString("ascii", 0, 4) !== "RIFF" ||
            data.toString("ascii", 8, 12) !== "WEBP"
          ) {
            error(`${field}: file is not a WebP image.`);
            return;
          }
          const fileName =
            "images/media-" +
            createHash("sha256").update(data).digest("hex").slice(0, 24) +
            ".webp";
          if (live) files.set(fileName, data);
          return "/" + fileName;
        } catch {
          error(`${field}: missing file or symlink (${name}).`);
          return;
        }
      }
      const url = https(value, field);
      if (
        url &&
        (!Object.hasOwn(formats, type) || !formats[type].test(url.pathname))
      )
        error(`${field}: unsupported ${type} format.`);
      return url?.href;
    }
    if (
      typeof record.id !== "string" ||
      !slug.test(record.id) ||
      seen.has(record.id)
    )
      error("Expected a unique slug in id.");
    seen.add(record.id);
    if (!["draft", "verified", "published"].includes(record.status))
      error("Invalid publication status.");
    if (!["pending", "approved", "rejected"].includes(record.rights))
      error("Invalid rights status.");
    if (record.status === "published" && !live)
      error("Published media requires approved rights.");
    if (record.rights === "approved")
      text(record.permissionRef, "permissionRef");
    if (!editions.has(record.edition)) error("Unknown edition.");
    if (
      !Object.hasOwn(roles, record.role) ||
      !roles[record.role].includes(record.type)
    )
      error("Invalid role or media type combination.");
    if (record.archive !== undefined && !kinds.includes(record.archive))
      error("Unknown archive section.");
    if (record.role === "archive" && !record.archive)
      error("Archive role requires an archive section.");
    if (record.language !== undefined && !locales.includes(record.language))
      error("Invalid language.");
    const related = {};
    if (!object(record.related)) error("related must be an object.");
    else
      for (const [field, ids] of Object.entries(record.related)) {
        if (
          !Object.hasOwn(relationships, field) ||
          !Array.isArray(ids) ||
          new Set(ids).size !== ids.length ||
          ids.some((id) => !relationships[field].includes(id))
        ) {
          error(`Invalid or unresolved related.${field}.`);
        } else related[field] = ids;
      }
    const required = {
      poster: "films",
      still: "films",
      preview: "films",
      portrait: "guests",
      workshop: "events",
    };
    if (
      Object.hasOwn(required, record.role) &&
      !related[required[record.role]]?.length
    )
      error(`Expected a related.${required[record.role]} record.`);
    const asset = {
      id: record.id,
      type: record.type,
      role: record.role,
      edition: record.edition,
      title: localized(record.title, "title"),
      description: localized(record.description, "description"),
      credit: text(record.credit, "credit"),
      copyrightOwner: text(record.copyrightOwner, "copyrightOwner"),
      source: https(record.source, "source")?.href,
      src: media(record.src, "src", record.type),
      language: record.language,
      archive: record.archive,
      related,
    };
    if (record.thumbnail !== undefined)
      asset.thumbnail = media(record.thumbnail, "thumbnail", "image");
    if (record.type === "image") {
      asset.alt = localized(record.alt, "alt");
      if (!positive(record.width) || !positive(record.height))
        error("Images require positive integer width and height.");
      asset.width = record.width;
      asset.height = record.height;
      if (record.variants !== undefined) {
        if (!Array.isArray(record.variants))
          error("variants must be an array.");
        else {
          const widths = new Set([record.width]);
          asset.variants = record.variants.map((variant) => {
            if (!positive(variant?.width) || widths.has(variant.width))
              error("Variant widths must be unique positive integers.");
            widths.add(variant?.width);
            return {
              src: media(variant?.src, "variant src", "image"),
              width: variant?.width,
            };
          });
        }
      }
    }
    if (record.type === "video") {
      if (record.captions !== undefined && !Array.isArray(record.captions))
        error("captions must be an array.");
      if (record.silent !== true && !record.captions?.length)
        error("Video requires captions or an explicit silent flag.");
      const languages = new Set();
      if (Array.isArray(record.captions))
        asset.captions = record.captions.map((track) => {
          if (!locales.includes(track?.locale) || languages.has(track?.locale))
            error("Caption locales must be supported and unique.");
          languages.add(track?.locale);
          return {
            src: media(track?.src, "caption src", "captions"),
            locale: track?.locale,
            label: text(track?.label, "caption label"),
          };
        });
    }
    if (record.type === "audio" || record.transcript !== undefined)
      asset.transcript = localized(record.transcript, "transcript");
    if (live && errors.length === start) assets.push(asset);
  });
  if (errors.length)
    throw new Error("Media validation failed:\n" + errors.join("\n"));
  return { assets, files };
}
