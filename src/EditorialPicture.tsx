import type { EditorialImage, Locale } from "./content";

export function EditorialPicture({
  image,
  locale,
  sizes,
  eager = false,
}: {
  image: EditorialImage;
  locale: Locale;
  sizes: string;
  eager?: boolean;
}) {
  if (image.rights !== "approved") return null;
  return (
    <img
      src={image.src}
      srcSet={image.variants
        ?.map(({ src, width }) => `${src} ${width}w`)
        .join(", ")}
      sizes={image.variants?.length ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={image.alt[locale]}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
