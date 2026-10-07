FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

RUN npm rebuild sqlite3 --build-from-source

COPY . .

EXPOSE 80

ENV PORT=80

CMD ["node", "server.js"]