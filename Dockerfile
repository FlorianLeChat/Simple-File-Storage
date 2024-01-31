# syntax=docker/dockerfile:1

# Use an customized image of Node.js
# https://hub.docker.com/_/node
FROM node:lts-alpine

# Add cURL for health check and OpenSSL for generating random secret
RUN apk --no-cache add curl openssl

# Set the working directory to the website files
WORKDIR /usr/src/app

# Change permissions of the working directory
RUN chown node:node .

# Copy all files required to build the project
COPY --chown=node:node . .

# Install all dependencies
# Use cache mount to speed up installation of existing dependencies
RUN --mount=type=cache,target=.npm \
	npm set cache .npm && \
	npm install && chown -R node:node ./node_modules

# Add wait script to wait for other services to be ready
ADD https://github.com/ufoscout/docker-compose-wait/releases/latest/download/wait /wait
RUN chmod +x /wait

# Use non-root user
USER node

# Find and replace some default environment variables
RUN sed -i "s/NEXT_PUBLIC_ENV=development/NEXT_PUBLIC_ENV=production/g" .env
RUN sed -i "s/AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/AUTH_SECRET=$(openssl rand -base64 32)/g" .env
RUN sed -i "s/username:password@127.0.0.1:3306/simple_file_storage:password@mariadb:3306/g" .env
RUN if [ -f "docker/config/db_root_password.txt" ]; then \
	sed -i "s/simple_file_storage:password/simple_file_storage:$(cat \/usr\/src\/app\/docker\/config\/db_root_password.txt)/" .env; \
fi

# Build the entire project
RUN npm run build

# Remove all development dependencies
RUN npm prune --production

# Create a custom entrypoint script
RUN mkdir -p docker
RUN echo "/wait && npm run migrate && npm run start" > docker/entrypoint.sh
RUN chmod +x docker/entrypoint.sh

CMD ["docker/entrypoint.sh"]