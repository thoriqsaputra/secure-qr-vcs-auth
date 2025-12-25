FROM oven/bun:1-alpine

WORKDIR /app

# Configure API base for Vite (overridable at build time)
ARG VITE_API_BASE="http://localhost:8000"
ENV VITE_API_BASE=${VITE_API_BASE}

# Install deps
COPY package.json bun.lock* ./
RUN bun install

COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev"]
