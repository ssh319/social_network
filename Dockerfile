# Build React application
FROM node:18 AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Build Express server
FROM node:18

WORKDIR /app

COPY server/package*.json ./
RUN npm install --production

COPY server/ .

COPY --from=client-build /app/client/build ./client/build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]