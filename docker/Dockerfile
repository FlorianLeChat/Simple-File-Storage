# syntax=docker/dockerfile:1

FROM node:22-slim AS base

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run db:generate && npm run build && npx tsc --skipLibCheck \
    scripts/create-fake-accounts.ts \
    scripts/expired-files.ts \
    scripts/outdated-notifications.ts && \
    npm prune --omit=dev

FROM node:22-slim AS production

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y --no-install-recommends cron openssl tzdata wget && \
    rm -rf /var/lib/apt/lists/*

COPY --from=base --chown=node:node /usr/src/app ./

RUN chmod +x ./docker/scripts/logrotate.sh && \
    echo "*/5 * * * * node /usr/src/app/scripts/expired-files.js > /dev/null 2>&1" >> /var/spool/cron/crontabs/node && \
    echo "*/5 * * * * node /usr/src/app/scripts/outdated-notifications.js > /dev/null 2>&1" >> /var/spool/cron/crontabs/node && \
    echo "0 0 * * * /usr/src/app/docker/scripts/logrotate.sh > /dev/null 2>&1" >> /var/spool/cron/crontabs/node
