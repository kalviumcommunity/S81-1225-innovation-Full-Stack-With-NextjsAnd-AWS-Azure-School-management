# syntax=docker/dockerfile:1

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (use lockfile for reproducibility)
COPY package-lock.json package.json ./
RUN npm ci

# Copy project files and build the app
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
