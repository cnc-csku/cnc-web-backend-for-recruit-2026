FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb* ./

# RUN bun install --production
RUN bun install --production

COPY tsconfig.json ./
COPY src ./src
COPY shared ./shared

CMD ["bun", "start"]
