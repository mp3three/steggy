FROM node:18 AS build
WORKDIR /app
ARG PROJECT_LIST

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --no-progress
# Having the files present before install causes nx to freak out
COPY --chown=node:node workspace.json nx.json tsconfig.base.json babel.config.json ./

# Now folders
COPY --chown=node:node .git ./.git
COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs

# RUN npx nx run-many --target=publish --projects="$PROJECT_LIST"
RUN echo "$PROJECT_LIST"
