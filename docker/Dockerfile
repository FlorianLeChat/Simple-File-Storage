# syntax=docker/dockerfile:1

FROM node:24-slim AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt update && \
	apt install -y openssl && \
    apt clean && rm -rf /var/lib/apt/lists/* && \
    npm ci

COPY . .

RUN npm run db:generate && npm run build && npx tsc --skipLibCheck \
    scripts/create-fake-accounts.ts \
    scripts/expired-files.ts \
    scripts/outdated-notifications.ts && \
    npm prune --omit=dev

FROM node:24-slim AS production

RUN apt update && \
	apt install -y cron openssl tzdata wget && \
    apt clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY --from=base --chown=node:node /usr/src/app ./

RUN chmod +x ./docker/scripts/logrotate.sh && \
    echo "*/5 * * * * node /usr/src/app/scripts/expired-files.js > /dev/null 2>&1" >> /var/spool/cron/crontabs/node && \
    echo "*/5 * * * * node /usr/src/app/scripts/outdated-notifications.js > /dev/null 2>&1" >> /var/spool/cron/crontabs/node && \
    echo "0 0 * * * /usr/src/app/docker/scripts/logrotate.sh > /dev/null 2>&1" >> /var/spool/cron/crontabs/node