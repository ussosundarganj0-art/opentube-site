FROM node:22-slim

# OpenTube — free permanent hosting (Render / any Docker host)
ENV PORT=7860
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg curl ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp + plugin + bundled ffmpeg fallback
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp imageio-ffmpeg bgutil-ytdlp-pot-provider

# PO-token provider (helps yt-dlp on datacenter IPs)
RUN git clone --single-branch --branch 2.0.2 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /opt/bgutil-src \
    && cd /opt/bgutil-src/server \
    && npm ci && npx tsc \
    && mv /opt/bgutil-src /opt/bgutil

WORKDIR /app
COPY server.js config.json ./
COPY public ./public

RUN mkdir -p /tmp/othyb && useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 7860
CMD ["sh", "-c", "node /opt/bgutil/server/build/main.js & exec node server.js"]
