import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    sequence: { hooks: "stack" },
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@app": new URL("./src/app", import.meta.url).pathname,
      "@lib": new URL("./src/lib", import.meta.url).pathname
    }
  }
});
