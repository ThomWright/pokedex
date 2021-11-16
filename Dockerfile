FROM mhart/alpine-node:14 AS builder

RUN apk add --update \
  rsync \
  git

WORKDIR /app

COPY tsconfig* ./
COPY .git/ ./.git

COPY package* ./
RUN npm ci

COPY src/ ./src

RUN npm run build:ts

# ---

FROM mhart/alpine-node:14

WORKDIR /app
COPY README.md .
COPY Dockerfile .
COPY package* ./
COPY --from=builder /app/dist/ ./dist

RUN npm ci --production

EXPOSE 3000

# Yeah, we could change this per-environment... but I never do!
ENV NODE_ENV production

CMD ["node", "dist/index.js"]
