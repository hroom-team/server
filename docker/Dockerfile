FROM node:20-alpine as builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${API_PORT}/api/v1/health || exit 1

# Start application
CMD ["node", "dist/index.js"]