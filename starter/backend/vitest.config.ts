import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Dummy values so config/secrets.ts's fail-fast validation passes in
    // tests without needing a real .env - this is test-only wiring, the
    // fail-fast check itself is never weakened or bypassed.
    env: {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SIGNING_KEY: "test-signing-key-not-for-real-use-only",
    },
  },
});
