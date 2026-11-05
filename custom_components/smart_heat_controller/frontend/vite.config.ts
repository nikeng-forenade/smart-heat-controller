import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
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
