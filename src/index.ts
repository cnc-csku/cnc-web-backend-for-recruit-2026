import { app } from "./app";
import { config } from "./core/config";

app.listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
