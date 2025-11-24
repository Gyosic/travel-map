FROM node:lts-alpine AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Timezone Settings
RUN apk add --no-cache tzdata

RUN cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime
RUN echo "Asia/Seoul" > /etc/timezone

ENV TZ=Asia/Seoul

# Application Environment
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --chown=node:node ecosystem.config.js ./ecosystem.config.js

# Read more at: https://nextjs.org/docs/messages/sharp-missing-in-production
FROM base AS depends

RUN npm -dd i sharp

FROM base AS runner

RUN npm -dd i -g pm2

COPY --from=depends --chown=node:node /app/node_modules ./node_modules

COPY --chown=node:node dist/. .
# COPY --chown=node:node .next/standalone ./
# COPY --chown=node:node .next/static ./.next/static
# COPY --chown=node:node public ./public

# Volume Settings
VOLUME "/app/files"

EXPOSE 3000

USER node

ENTRYPOINT ["pm2-runtime", "ecosystem.config.js"]
