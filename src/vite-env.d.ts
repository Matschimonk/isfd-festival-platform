/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_ORIGIN?: string;
}

declare module "virtual:festival-media" {
  const assets: import("./media-types").MediaAsset[];
  export default assets;
}
