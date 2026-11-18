import { locales, validate } from "./schema.js";
const get = (id) => document.getElementById(id);
const editor = get("editor"),
  chooser = get("records"),
  status = get("status");
let records = [];
let editing = -1;
for (const locale of locales) {
  const fields = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = { en: "English", it: "Italiano", de: "Deutsch" }[locale];
  fields.append(legend);
  for (const field of ["title", "description"]) {
    const label = document.createElement("label");
    const input = document.createElement(
      field === "title" ? "input" : "textarea",
    );
    input.name = field + "-" + locale;
    label.append(field === "title" ? "Title" : "Description", input);
    fields.append(label);
  }
  get("languages").append(fields);
}

function read() {
  const fields = new FormData(editor);
  const value = (name) => String(fields.get(name) ?? "");
  const localized = (field) =>
    Object.fromEntries(
      locales.map((locale) => [locale, value(field + "-" + locale)]),
    );
  return {
    type: value("type"),
    id: value("id"),
    edition: Number(value("edition")),
    status: value("status"),
    source: value("source"),
    title: localized("title"),
    description: localized("description"),
    rights: value("rights"),
    url: value("url"),
    credit: value("credit"),
  };
}
function preview() {
  const record = read(),
    locale = get("preview-language").value;
  get("media-fields").hidden = record.type !== "media";
  get("preview-label").textContent = [
    record.type,
    record.edition,
    record.status,
    "local preview",
  ].join(" · ");
  get("preview-name").textContent = record.title[locale] || "Title pending";
  get("preview-text").textContent =
    record.description[locale] || "Description pending";
}
function select(index) {
  editing = index;
  editor.reset();
  const record = records[index];
  if (record) {
    for (const field of [
      "type",
      "id",
      "edition",
      "status",
      "source",
      "rights",
      "url",
      "credit",
    ]) {
      if (record[field] !== undefined)
        editor.elements.namedItem(field).value = record[field];
    }
    for (const field of ["title", "description"])
      for (const locale of locales)
        editor.elements.namedItem(field + "-" + locale).value =
          record[field][locale];
  }
  preview();
}
function list() {
  chooser.replaceChildren(new Option("New record", ""));
  records.forEach((record, i) =>
    chooser.add(
      new Option(
        record.type + " / " + record.id,
        String(i),
        false,
        i === editing,
      ),
    ),
  );
}
editor.addEventListener("input", preview);
get("preview-language").addEventListener("change", preview);
chooser.addEventListener("change", () =>
  select(chooser.value === "" ? -1 : Number(chooser.value)),
);
editor.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const next = [...records],
      index = editing < 0 ? next.length : editing;
    next[index] = read();
    records = validate({ version: 1, records: next }).records;
    editing = index;
    list();
    status.textContent = "Working record saved in this tab.";
  } catch (error) {
    status.textContent = error.message;
  }
});
get("import").addEventListener("change", async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      throw new Error("Choose a JSON file smaller than 2 MB.");
    const incoming = validate(JSON.parse(await file.text()));
    records = incoming.records;
    select(-1);
    list();
    status.textContent = `Imported ${records.length} working records.`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    event.target.value = "";
  }
});
get("export").addEventListener("click", () => {
  const data = validate({ version: 1, records });
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const download = document.createElement("a");
  download.href = url;
  download.download = "isfd-editorial-review.json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "Exported saved working records.";
});
preview();
