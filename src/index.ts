import { app } from "./app";

app.get("/", () => "Hello Elysia");

app.listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
