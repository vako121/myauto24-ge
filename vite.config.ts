import { defineConfig } from "@lovable.dev/vite-tanstack-config";
export default defineConfig({
  cloudflare: true,
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});
