export const locales = ["en", "it", "de"];
const types = ["films", "events", "people", "partners", "media"];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const string = (value) => typeof value === "string" && value.trim().length > 0;
function https(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function validate(envelope) {
  if (envelope?.version !== 1 || !Array.isArray(envelope.records))
    throw new Error("Expected a version 1 records array.");
  const seen = new Set();
  return {
    version: 1,
    records: envelope.records.map((record, i) => {
      const fail = (reason) => {
        throw new Error(`Record ${i + 1}: ${reason}`);
      };
      if (
        !record ||
        !types.includes(record.type) ||
        typeof record.id !== "string" ||
        !slug.test(record.id)
      )
        fail("choose a collection and a valid slug");
      const key = record.type + "/" + record.id;
      if (seen.has(key)) fail("duplicate ID in this collection");
      seen.add(key);
      if (
        !Number.isInteger(record.edition) ||
        record.edition < 2026 ||
        record.edition > 2100
      )
        fail("invalid edition");
      if (!["draft", "published"].includes(record.status))
        fail("invalid status");
      if (
        (record.source || record.status === "published") &&
        !https(record.source)
      )
        fail("provide a public HTTPS source");
      const localized = (field) =>
        Object.fromEntries(
          locales.map((locale) => {
            const value = record[field]?.[locale];
            if (
              typeof value !== "string" ||
              (record.status === "published" && !string(value))
            )
              fail(`complete ${field} for ${locale.toUpperCase()}`);
            return [locale, value.trim()];
          }),
        );
      const result = {
        type: record.type,
        id: record.id,
        edition: record.edition,
        status: record.status,
        source: record.source || "",
        title: localized("title"),
        description: localized("description"),
      };
      if (record.type === "media") {
        if (!["approved", "pending"].includes(record.rights))
          fail("choose a rights status");
        if (record.url && !https(record.url)) fail("media URL must be HTTPS");
        if (record.credit != null && typeof record.credit !== "string")
          fail("media credit must be text");
        if (
          record.status === "published" &&
          (record.rights !== "approved" ||
            !https(record.url) ||
            !string(record.credit))
        )
          fail(
            "published media requires approved rights, an HTTPS URL and credit",
          );
        Object.assign(result, {
          rights: record.rights,
          url: record.url || "",
          credit: record.credit?.trim() ?? "",
        });
      }
      return result;
    }),
  };
}
