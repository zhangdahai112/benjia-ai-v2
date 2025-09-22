# Use Node.js 18 as the base image
FROM node:18-alpine AS deps
# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Copy source code
COPY . .

# Build the application
RUN pnpm build

RUN ls /app

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
# Install pnpm globally
RUN npm install -g pnpm

# Install serve globally to serve the static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Create a non-root user with an explicit UID and add permission to access the folder
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy standalone server files
COPY --from=builder /app/out ./out

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "out"]