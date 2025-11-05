# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# ARG for build-time environment variables
ARG NEXT_PUBLIC_PARSE_APP_ID
ARG NEXT_PUBLIC_PARSE_JS_KEY
ARG NEXT_PUBLIC_PARSE_SERVER_URL
ARG NEXT_PUBLIC_APP_URL

# Pass to environment for Next.js build
ENV NEXT_PUBLIC_PARSE_APP_ID=$NEXT_PUBLIC_PARSE_APP_ID
ENV NEXT_PUBLIC_PARSE_JS_KEY=$NEXT_PUBLIC_PARSE_JS_KEY
ENV NEXT_PUBLIC_PARSE_SERVER_URL=$NEXT_PUBLIC_PARSE_SERVER_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Set correct permissions first
RUN mkdir -p /app/.next && chown -R nextjs:nodejs /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the Next.js app
CMD ["node", "server.js"]
