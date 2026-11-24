FROM node:22-slim

# OpenTube — free permanent hosting (Render / any Docker host)
ENV PORT=7860
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg curl ca-certificates git \
    build-essential pkg-config python3-dev \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp + plugin + bundled ffmpeg fallback
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp==2026.10.26 imageio-ffmpeg bgutil-ytdlp-pot-provider==2.0.2

# PO-token provider (helps yt-dlp on datacenter IPs) — build is non-fatal
RUN git clone --single-branch --branch 2.0.2 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /opt/bgutil-src \
    && cd /opt/bgutil-src/server \
    && { npm ci --include=dev && npx tsc; } || { echo "WARNING: provider build failed"; npx tsc 2>&1 | tail -20 > /opt/bgutil-src/tsc-error.log || true; } \
    && mv /opt/bgutil-src /opt/bgutil

WORKDIR /app
COPY server.js config.json ./
COPY public ./public

RUN mkdir -p /tmp/othyb && useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 7860
CMD ["sh", "-c", "(node /opt/bgutil/server/build/main.js &) ; exec node server.js"]
