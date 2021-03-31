FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/home-controller .
ENV PORT=3000
EXPOSE ${PORT}
RUN yarn install --production
# FIXME: Why is the webpack tree shaker removing platform-express?
RUN yarn add @nestjs/platform-express
CMD node ./main.js
