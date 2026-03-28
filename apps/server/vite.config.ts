import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    target: "node22",
    ssr: true,
    rollupOptions: {
      input: "src/index.ts",
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  ssr: {
    noExternal: true,
    external: ["express"],
  },
});
