import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    passWithNoTests: true
  },
  resolve: {
    alias: {
      "@app": new URL("./src/app", import.meta.url).pathname,
      "@content": new URL("./src/content", import.meta.url).pathname,
      "@lib": new URL("./src/lib", import.meta.url).pathname,
      "@interactions": new URL("./src/interactions", import.meta.url).pathname
    }
  }
});
