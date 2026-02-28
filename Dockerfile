FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install all deps for build
FROM base AS builder-deps
COPY package.json package-lock.json ./
RUN npm ci

# Build app
FROM base AS builder
COPY --from=builder-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Install prod deps only for runtime
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Runtime image (works on serverless containers)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
