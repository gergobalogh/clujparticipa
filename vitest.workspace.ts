// @ts-expect-error -- defineWorkspace exists at runtime but not in vitest/config type declarations
import { defineWorkspace } from "vitest/config"; // eslint-disable-line -- TS2305 is a vitest type issue, works at runtime
import path from "path";

export default defineWorkspace([
  {
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    test: {
      name: "unit",
      environment: "node",
      include: ["src/lib/**/*.test.ts", "src/app/api/**/*.test.ts"],
      setupFiles: ["./src/test/setup.ts"],
      globals: true,
      pool: "forks",
      testTimeout: 15_000,
    },
  },
  {
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    test: {
      name: "component",
      environment: "jsdom",
      include: ["src/components/**/*.test.tsx", "src/hooks/**/*.test.ts"],
      setupFiles: ["./src/test/setup.ts", "./src/test/setup-component.ts"],
      globals: true,
      pool: "forks",
      testTimeout: 15_000,
    },
  },
]);
