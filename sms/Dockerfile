# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy Prisma schema
COPY prisma ./prisma

# Environment setup
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start command
CMD ["npm", "start"]


# Start the app
CMD ["npm", "run", "start"]
