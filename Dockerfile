FROM node:20-slim

# OpenTube — free permanent hosting (Hugging Face Docker Space / any Docker host)
ENV PORT=7860
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp (YouTube extraction) + imageio-ffmpeg (bundled ffmpeg fallback)
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp imageio-ffmpeg

WORKDIR /app
COPY server.js config.json ./
COPY public ./public

RUN mkdir -p /tmp/othyb && useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 7860
CMD ["node", "server.js"]
