FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

COPY package.json ./

RUN npm install --production=false

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

RUN npm prune --production

USER pwuser

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
