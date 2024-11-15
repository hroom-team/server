FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --production

ENV API_PORT=3000
ENV TZ=Europe/Moscow

EXPOSE 3000

CMD ["node", "dist/server/index.js"]