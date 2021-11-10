FROM mhart/alpine-node:14

WORKDIR /app
COPY . .

EXPOSE 3000

# Yeah, we could change this per-environment... but I never do!
ENV NODE_ENV production

CMD ["node", "dist/index.js"]
