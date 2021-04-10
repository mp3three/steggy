# Stage 1: Build
FROM node:lts-alpine AS build
USER node
WORKDIR /app
COPY --chown=node:node ./dist/apps/home-controller/package.json .
RUN yarn install --production  --frozen-lockfile
# FIXME: Why is the webpack tree shaker removing platform-express?
RUN yarn add @nestjs/platform-express

# Stage 2: Serve
FROM node:lts-alpine
USER node
WORKDIR /app
COPY --chown=node:node ./dist/apps/home-controller .
COPY --from=builder /app/node_modules node_modules
ENV PORT=3000
EXPOSE 3000
CMD ["node", "./main.js"]
