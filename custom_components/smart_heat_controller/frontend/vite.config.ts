import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(
  readFileSync(resolve(__dirname, "../manifest.json"), "utf-8"),
) as { version: string };

export default defineConfig({
  define: {
    __SHC_VERSION__: JSON.stringify(manifest.version),
  },
  build: {
    target: "es2022",
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "smart-heat-controller.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "smart-heat-controller.js",
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },
});
