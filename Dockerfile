FROM mhart/alpine-node:14

WORKDIR /app
COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]
