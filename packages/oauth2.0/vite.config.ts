import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";

const isNode = process.env._IS_NODE_ === "true" ?? true;

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: isNode ? "server" : "browser",
    },
    emptyOutDir: false,
  },
  plugins: [
    {
      ...replace({
        '"_IS_NODE_"': isNode,
        preventAssignment: true,
        delimiters: ["", ""],
      }),
      enforce: "post",
      apply: "build",
    },
  ],
});
