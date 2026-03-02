import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const reactPath = path.resolve(__dirname, "node_modules/.pnpm/react@19.2.4/node_modules/react");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: reactPath,
      "react/jsx-runtime": path.join(reactPath, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(reactPath, "jsx-dev-runtime.js")
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx"],
    server: {
      deps: {
        inline: ["react", "react-dom", "@testing-library/react"]
      }
    }
  }
});
