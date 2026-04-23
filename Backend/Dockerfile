FROM node:22-alpine AS builder

# python3 + make + g++ needed for bcrypt and other native packages
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files FIRST (Docker layer cache optimization)
COPY package.json ./
COPY package-lock.json ./

# Copy prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.js ./

# Install ALL deps including devDependencies (need tsc to build)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Now copy all source code
COPY . .

# Build TypeScript → JavaScript
# Output goes to ./dist folder
RUN npm run build


# ── STAGE 2: Run ──────────────────────────────
FROM node:22-alpine AS runner

# Install PM2
RUN npm install -g pm2

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Copy prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.js ./

# Install production deps only
RUN npm install --omit=dev

# Generate Prisma client in production image
RUN npx prisma generate

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3005/health || exit 1

# Start
CMD ["pm2-runtime", "start", "dist/server.js", "--name", "skillforge-api"]
