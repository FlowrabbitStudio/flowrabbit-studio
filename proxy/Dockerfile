FROM node:20-alpine AS builder
RUN apk update && apk upgrade --no-cache
USER node
WORKDIR /home/node

COPY --chown=node:node ["package.json", "package-lock.json", "./"]
RUN npm install
COPY --chown=node:node ["src/", "./src/"]
RUN npm run build


FROM node:20-alpine AS deps
RUN apk update && apk upgrade --no-cache
USER node
WORKDIR /home/node
WORKDIR /home/node

COPY --chown=node:node ["package.json", "package-lock.json", "./"]
RUN npm install --omit=dev


FROM node:20-alpine AS runner
RUN apk update && apk upgrade --no-cache
USER node
WORKDIR /home/node

COPY --chown=node:node --from=deps ["/home/node/node_modules", "node_modules/"]
COPY --chown=node:node --from=builder ["/home/node/lib", "lib/"]

CMD [ "node", "lib/index.js" ]