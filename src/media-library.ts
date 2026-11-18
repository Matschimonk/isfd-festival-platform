import assets from "virtual:festival-media";
import type { MediaAsset, MediaRole } from "./media-types";

export const media = assets;
export function relatedMedia(
  role: MediaRole,
  relation: keyof MediaAsset["related"],
  id: string,
) {
  return media.filter(
    (asset) => asset.role === role && asset.related[relation]?.includes(id),
  );
}
