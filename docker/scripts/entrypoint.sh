#!/bin/sh

# Generate random secret for JWT
sed -i "s#AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#AUTH_SECRET=$(openssl rand -base64 32)#g" .env

# Execute database migrations
npm run migrate

# Start NextJS local server
npm run start