FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/home-controller .
ENV PORT=3000
EXPOSE ${PORT}
RUN yarn install --production
CMD node ./main.js
