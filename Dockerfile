# Multistage build for production runtime optimization
FROM node:22-alpine AS builder

WORKDIR /app

# Install project dependencies
COPY package*.json ./
RUN npm ci

# Copy full repository content
COPY . .

# Run static compilation and bundler compiler builds
RUN npm run build

# Production image assembly stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only to save storage
RUN npm ci --only=production

# Expose active routing reverse proxy port
EXPOSE 3000

# Start deployment server
CMD ["node", "dist/server.cjs"]
