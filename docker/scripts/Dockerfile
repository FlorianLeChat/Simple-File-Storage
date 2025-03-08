# syntax=docker/dockerfile:1

# Use an customized image of Node.js
# https://hub.docker.com/_/node
FROM node:lts-alpine

# Install system dependencies
RUN apk add --no-cache logrotate openssl supercronic

# Set the working directory to the website files
WORKDIR /usr/src/app

# Change permissions of the working directory
RUN chown node:node .

# Copy all files required to build the project
COPY --chown=node:node . .

# Create a directory for the Next.js build cache
RUN mkdir -p .next && chown -R node:node .next

# Install all dependencies
# Use cache mount to speed up installation of existing dependencies
RUN --mount=type=cache,target=.npm \
	npm set cache .npm && \
	npm ci && chown -R node:node ./node_modules

# Add some cronjobs for automated tasks
RUN npx tsc --skipLibCheck scripts/create-fake-accounts.ts scripts/expired-files.ts scripts/outdated-notifications.ts && \
	echo "*/5 * * * * node /usr/src/app/scripts/expired-files.js > /dev/null 2>&1" >> /var/spool/cron/crontabs/node && \
	echo "*/5 * * * * node /usr/src/app/scripts/outdated-notifications > /dev/null 2>&1" >> /var/spool/cron/crontabs/node && \
	echo "0 0 * * * logrotate -f /usr/src/app/docker/configuration/logrotate.conf -s /usr/src/app/docker/configuration/logrotate.status > /dev/null 2>&1" >> /var/spool/cron/crontabs/node

# Add wait script to wait for other services to be ready
ADD --chmod=0755 https://github.com/ufoscout/docker-compose-wait/releases/latest/download/wait /wait

# Use non-root user
USER node

# Build the entire project and remove all development dependencies
#  before making the entrypoint script executable
RUN npm run build && npm prune --production && chmod +x ./docker/scripts/entrypoint.sh