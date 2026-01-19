import openapi from "@elysiajs/openapi";
import { app } from "./app";
import { config } from "./core/config";
import { openapiConfig } from "./core/openapi";

app.listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
