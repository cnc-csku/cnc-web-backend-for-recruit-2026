FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --production

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "src/index.ts"]
