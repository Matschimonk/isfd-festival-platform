import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadMedia } from "./media-library.mjs";

const label = { en: "Fixture", it: "Test", de: "Test" };
const festival = {
  editions: [{ year: 2026, status: "published" }],
  films: [{ id: "bellissima", status: "published" }],
  people: [],
  awards: [],
  screenings: [],
  workshops: [],
  venues: [],
  events: [{ id: "draft-event", status: "draft" }],
};
const poster = {
  id: "test-poster",
  type: "image",
  role: "poster",
  edition: 2026,
  archive: "gallery",
  title: label,
  description: label,
  alt: label,
  credit: "Fixture credit",
  copyrightOwner: "Fixture holder",
  source: "https://example.org/source",
  src: "local:fixture.webp",
  width: 1200,
  height: 600,
  rights: "approved",
  status: "published",
  permissionRef: "PRIVATE-REFERENCE",
  related: { films: ["bellissima"] },
};

test("projects only approved public records and their derivatives", () => {
  const dir = mkdtempSync(join(tmpdir(), "isfd-media-"));
  try {
    copyFileSync(
      new URL("../public/images/hero.webp", import.meta.url),
      join(dir, "fixture.webp"),
    );
    copyFileSync(join(dir, "fixture.webp"), join(dir, "private.webp"));
    const draft = {
      ...poster,
      id: "private-draft",
      src: "local:private.webp",
      status: "draft",
      rights: "pending",
      title: { ...label, en: "PRIVATE-TITLE" },
    };
    const { assets, files } = loadMedia([poster, draft], festival, dir);
    assert.equal(assets.length, 1);
    assert.equal(files.size, 1);
    assert.match(assets[0].src, /^\/images\/media-[a-f0-9]{24}\.webp$/);
    assert.doesNotMatch(JSON.stringify(assets), /PRIVATE|private/);
    assert.throws(
      () => loadMedia([{ ...draft, status: "published" }], festival, dir),
      /approved rights/,
    );
    assert.throws(
      () =>
        loadMedia([{ ...poster, src: "local:missing.webp" }], festival, dir),
      /missing file/,
    );
    symlinkSync(join(dir, "fixture.webp"), join(dir, "alias.webp"));
    assert.throws(
      () => loadMedia([{ ...poster, src: "local:alias.webp" }], festival, dir),
      /symlink/,
    );
    writeFileSync(join(dir, "fake.webp"), "not media");
    assert.throws(
      () => loadMedia([{ ...poster, src: "local:fake.webp" }], festival, dir),
      /not a WebP/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("reports editorial fields, relationships, URLs, formats and captions", () => {
  const invalid = {
    ...poster,
    src: "https://example.org/not-an-image.svg",
    source: "http://example.org/source",
    copyrightOwner: "",
    credit: "",
    alt: { en: "Only English" },
    related: { films: ["fake"], events: ["draft-event"] },
  };
  assert.throws(
    () => loadMedia([invalid], festival, "/tmp"),
    (error) =>
      [
        "source must be",
        "unsupported image",
        "credit is required",
        "copyrightOwner is required",
        "alt.it",
        "alt.de",
        "related.films",
        "related.events",
      ].every((item) => error.message.includes(item)),
  );
  const video = {
    ...poster,
    type: "video",
    role: "preview",
    src: "https://example.org/clip.mp4",
  };
  assert.throws(
    () => loadMedia([video], festival, "/tmp"),
    /captions or an explicit silent flag/,
  );
  assert.equal(
    loadMedia(
      [
        {
          ...video,
          captions: [
            {
              src: "https://example.org/de.vtt",
              locale: "de",
              label: "Deutsch",
            },
          ],
        },
      ],
      festival,
      "/tmp",
    ).assets.length,
    1,
  );
});
