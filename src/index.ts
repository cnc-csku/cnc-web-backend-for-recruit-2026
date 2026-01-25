import { app } from "./app";
import { config } from "./core/config";
import { logger } from "./core/logger";

app.listen(config.port);

const appUrl = `${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`;
logger.info("============= CNC Backend API =================");
logger.info(`[server] 🦊 CNC Backend API is running at ${appUrl}`);
logger.info(`[server] 📖 See documentation here ${appUrl}/openapi`);
logger.info("===============================================");
