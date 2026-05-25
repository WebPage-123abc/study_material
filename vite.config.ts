import { defineConfig } from "vite";
import path from "path";

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  publicDir: "public",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(import.meta.dirname, "index.html"),
        subjects: path.resolve(import.meta.dirname, "subjects.html"),
        "subject-detail": path.resolve(import.meta.dirname, "subject-detail.html"),
        favorites: path.resolve(import.meta.dirname, "favorites.html"),
        search: path.resolve(import.meta.dirname, "search.html"),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
