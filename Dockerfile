# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

ARG NODE_VERSION=24.12.0-slim

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /market-flow-app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then; \
    corepack enable yarn && yarn install --frozen-lockfile --production=false; \
  elif [ -f pnpm-lock.yaml ]; then; \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
    echo "NO Lockfile found." && exit 1; \
  fi

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================

FROM node:${NODE_VERSION} AS builder

WORKDIR /market-flow-app

COPY --from=dependencies /market-flow-app/node_modules ./node_modules

COPY . .

ENV NODE_ENV=production

RUN if [ -f package-lock.json ]; then \
    npm run build; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

WORKDIR /market-flow-app


ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /market-flow-app/public ./public

RUN mkdir .next
RUN chown node:node .next

COPY --from=builder --chown=node:node /market-flow-app/.next/standalone ./
COPY --from=builder --chown=node:node /market-flow-app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]