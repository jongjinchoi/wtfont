FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

COPY package.json ./

RUN npm install --production=false

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

RUN npm prune --production

EXPOSE 3200

USER pwuser

ENV NODE_ENV=production
ENV PORT=3200

CMD ["node", "dist/server.js"]
