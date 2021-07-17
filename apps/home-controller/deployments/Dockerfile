# Generate node_modules
FROM node:16-alpine AS build
ARG CONFIGURATION='home-controller'

USER node
WORKDIR /app
ARG path="dist/apps/${CONFIGURATION}"
COPY --chown=node:node $path .
RUN yarn install --production --frozen-lockfile

# Final build
FROM node:16-alpine
ARG BUILD_DATE
ARG MAINTAINER
ARG BUILD_VERSION
ARG DESCRIPTION
ARG URL
ARG VCS_URL
ARG VCS_REF
ARG NAME

# LABELS
LABEL maintainer=$MAINTAINER
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.version=$BUILD_VERSION
LABEL org.label-schema.name=$CONFIGURATION
LABEL org.label-schema.url=$URL
LABEL org.label-schema.vcs-url=$VCS_URL
LABEL org.label-schema.description=$DESCRIPTION
LABEL org.label-schema.vendor=$NAME
LABEL org.label-schema.vcs-ref=$VCS_REF

LABEL org.label-schema.schema-version="1.0"

USER node
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/minified.js main.js
COPY --from=build /app/package.json package.json
COPY --from=build /app/assets assets

CMD ["node", "./main.js"]
