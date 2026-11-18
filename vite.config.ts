import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { festival } from "./src/archive";
import { loadMedia } from "./scripts/media-library.mjs";

const manifest = fileURLToPath(
  new URL("./content/media.json", import.meta.url),
);
const mediaDir = fileURLToPath(
  new URL("./content/media-files/", import.meta.url),
);
const moduleId = "\0virtual:festival-media";

function festivalMedia(checkOnly: boolean): Plugin {
  const library = () =>
    loadMedia(JSON.parse(readFileSync(manifest, "utf8")), festival, mediaDir);
  let current: ReturnType<typeof library>;
  let ssr = false;
  return {
    name: "festival-media",
    configResolved(config) {
      ssr = Boolean(config.build.ssr);
    },
    buildStart() {
      current = library();
      this.addWatchFile(manifest);
      if (checkOnly)
        console.log(
          `Validated media manifest: ${current.assets.length} public records, ${current.files.size} local derivatives.`,
        );
    },
    resolveId(id) {
      if (id === "virtual:festival-media") return moduleId;
    },
    load(id) {
      if (id === moduleId)
        return `export default ${JSON.stringify(current.assets)};`;
    },
    generateBundle() {
      if (!ssr)
        for (const [fileName, source] of current.files)
          this.emitFile({ type: "asset", fileName, source });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = current?.files.get((req.url ?? "").slice(1).split("?")[0]);
        if (!file) return next();
        res.setHeader("Content-Type", "image/webp");
        res.end(file);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    fs: {
      deny: [
        "**/.env",
        "**/.env.*",
        "**/*.{crt,pem}",
        "**/.git/**",
        "**/content/media.json",
        "**/content/media-files/**",
      ],
    },
  },
  plugins: [festivalMedia(mode === "media-check")],
  ...(mode === "media-check" ? { build: { write: false } } : {}),
}));
