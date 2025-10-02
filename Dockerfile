# Stage 1 — build
FROM node:20-alpine AS build
WORKDIR /app

# Install build deps (git for some npm packages if needed)
RUN apk add --no-cache git

# Copy package files first for better caching
COPY package*.json ./
# If you use pnpm or yarn, adjust accordingly
RUN npm ci --production=false

# Copy rest of app
COPY . .

# If you have a build step (e.g., transpile), run it here
# For plain node apps this is usually not needed
# RUN npm run build

# Stage 2 — production image
FROM node:20-alpine AS prod
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production dependencies from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Copy source files (or built files if you have a build step)
COPY --from=build /app ./

# Set environment
ENV NODE_ENV=production
ENV PORT=9000

# Expose port
EXPOSE 9000

# Use non-root user
USER appuser

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -qO- http://localhost:9000/ || exit 1

# Start the app
# Use your start script (adjust if it's `npm run start:prod` etc.)
CMD ["node", "server.js"]
