import { secrets } from "./config/secrets"; // validated first - fail fast if misconfigured
import { createApp } from "./app";
import { logger } from "./config/logger";

const app = createApp();

app.listen(secrets.PORT, () => {
  logger.info(`TinyLink backend listening on http://localhost:${secrets.PORT}`);
});
