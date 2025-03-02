#!/bin/sh

# Generate random secret for JWT
sed -i "s#AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#AUTH_SECRET=$(openssl rand -base64 32)#g" .env

# Wait for external services to be ready
/wait

# Execute database migrations
npm run migrate

# Run cron service in background
supercronic /etc/crontabs/www-data &

# Start NextJS local server
npm run start