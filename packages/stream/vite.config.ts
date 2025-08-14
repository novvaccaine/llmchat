import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    outDir: "dist",
    target: "node22",
  },
  esbuild: {
    platform: "node",
  },
  define: {
    global: "globalThis",
  },
});
