import type { Locale, LocalizedContent } from "./content";

export type ArchiveKind =
  | "featured"
  | "gallery"
  | "clips"
  | "aftermovie"
  | "interviews"
  | "screenings"
  | "awards"
  | "backstage"
  | "press";
export type MediaRole =
  | "poster"
  | "still"
  | "preview"
  | "portrait"
  | "interview"
  | "podcast"
  | "workshop"
  | "archive";
export interface MediaAsset {
  id: string;
  type: "image" | "video" | "audio";
  role: MediaRole;
  edition: number;
  title: LocalizedContent;
  description: LocalizedContent;
  credit: string;
  copyrightOwner: string;
  source: string;
  src: string;
  alt?: LocalizedContent;
  variants?: { src: string; width: number }[];
  width?: number;
  height?: number;
  thumbnail?: string;
  captions?: { src: string; locale: Locale; label: string }[];
  transcript?: LocalizedContent;
  language?: Locale;
  archive?: ArchiveKind;
  related: {
    films?: string[];
    guests?: string[];
    events?: string[];
    venues?: string[];
  };
}
