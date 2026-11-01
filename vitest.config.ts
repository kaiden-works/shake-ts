import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: ["src/**/*.ts"],
    mockReset: true,
    unstubGlobals: true,
    restoreMocks: true,
  },
});
