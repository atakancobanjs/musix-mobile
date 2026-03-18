FROM node:18-slim

# 1. Sistem paketlerini güncelle ve GEREKLİ araçları (python3-pip dahil) kur
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip python3-full && \
    rm -rf /var/lib/apt/lists/*

# 2. yt-dlp'yi --break-system-packages bayrağı ile kur
RUN pip3 install --no-cache-dir yt-dlp --break-system-packages

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 10000

CMD ["node", "index.js"]
