import path from "node:path";

import { config } from "dotenv";
import { defineConfig } from "vitest/config";

import { environmentConfig } from "./infra/config/index";

config();

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      include: ["infra", "src"],
    },
    environment: "node",
    env: {
      AWS_REGION: environmentConfig.dev?.awsEnvironment.region,
      AWS_PROFILE: environmentConfig.dev?.awsEnvironment.profile,
      POWERTOOLS_DEV: "true",
      POWERTOOLS_METRICS_ENABLED: "true",
    },
  },
  resolve: {
    alias: {
      "@infra": path.resolve(__dirname, "./infra"),
      "@src": path.resolve(__dirname, "./src"),
      "@utils": path.resolve(__dirname, "./utils"),
    },
  },
});
