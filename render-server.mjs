import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { serve } from "srvx/node";
import { serveStatic } from "srvx/static";

import serverEntry from "./dist/server/server.js";

const rootDir = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(rootDir, "dist/client");
const port = process.env.PORT || 3000;
const staticAssets = serveStatic({ dir: clientDir });

function shouldServeStaticAsset(request) {
  const { pathname } = new URL(request.url);
  return pathname.startsWith("/_build/") || /\.[a-z0-9]+$/i.test(pathname);
}

serve({
  port,
  hostname: "0.0.0.0",
  middleware: existsSync(clientDir)
    ? [(request, next) => (shouldServeStaticAsset(request) ? staticAssets(request, next) : next())]
    : [],
  async fetch(request) {
    return serverEntry.fetch(request);
  },
  error(error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  },
});