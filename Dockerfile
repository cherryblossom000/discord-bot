# syntax=docker/dockerfile:1

FROM node:16-alpine AS workspace
WORKDIR /app

RUN apk --no-cache add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# https://pnpm.io/cli/fetch
COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY . .
RUN pnpm -F bot -F . -F scripts i --offline
RUN pnpm -F scripts build
RUN pnpm -F bot exec tsc -b src
RUN pnpm -F bot build:site
RUN pnpm -F bot -P deploy bot

FROM workspace
ARG port=3000
COPY --from=workspace /app/bot .

EXPOSE $port
ENTRYPOINT ["node", "dist/src/server"]
