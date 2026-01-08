# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

## Env
This project DB is mongoDB in order to do transaction to avoid race condition need to enable replicas set using this exact URI

```bash
MONGO_URI=mongodb://localhost:27017?replicaSet=rs0
```

Open http://localhost:3000/ with your browser to see the result.