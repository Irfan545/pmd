#!/bin/bash

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build

# Create dist directory if it doesn't exist
mkdir -p dist

echo "Build completed successfully!" 