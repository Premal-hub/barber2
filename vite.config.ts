import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  nitro: {
    preset: "cloudflare-pages",
    hooks: {
      compiled() {
        const target = path.resolve("dist/_worker.js/wrangler.json");
        if (fs.existsSync(target)) {
          fs.unlinkSync(target);
          console.log("[nitro-hook] Successfully removed dist/_worker.js/wrangler.json");
        }
      },
    },
  },

  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    ssr: {
      noExternal: [
        /^@tanstack\/react-start/,
        /^@tanstack\/start-/,
        /^@tanstack\/router-/,
        /^@tanstack\/react-router/,
      ],
    },
  },
});