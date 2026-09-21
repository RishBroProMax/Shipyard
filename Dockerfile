FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl bash docker-cli

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN node ./node_modules/prisma/build/index.js generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV SHIPYARD_DATA_DIR="/var/lib/shipyard/data"

RUN mkdir -p /var/lib/shipyard/data

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000
CMD ["npm", "start"]
