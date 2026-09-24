import { defineConfig } from "vite";
export default defineConfig({
  root: "app",
  publicDir: "../public",
  base: "./",
  build: { outDir: "../dist", emptyOutDir: true },
});
