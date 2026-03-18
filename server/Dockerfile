FROM node:18-slim

# Sistem bağımlılıkları (ffmpeg, python vb.)
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir yt-dlp

WORKDIR /usr/src/app

# Sadece server klasöründeki dosyaları kopyalar (Render Root Directory sayesinde)
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 10000
CMD ["node", "index.js"]