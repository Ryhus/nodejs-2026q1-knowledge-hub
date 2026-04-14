# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json /usr/src/app
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /usr/src/app
ENV PORT=4000
ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --omit=dev

RUN adduser -D -h /usr/src/app appuser

COPY --from=builder --chown=appuser:appuser /usr/src/app/dist ./dist
COPY --from=builder --chown=appuser:appuser /usr/src/app/prisma ./prisma
COPY --from=builder --chown=appuser:appuser /usr/src/app/prisma.config.ts .

USER appuser

EXPOSE 4000

CMD sh -c "node dist/src/main.js"

