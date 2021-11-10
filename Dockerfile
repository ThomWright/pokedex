FROM mhart/alpine-node:14

WORKDIR /app
COPY . .

CMD ["node", "dist/index.js"]
