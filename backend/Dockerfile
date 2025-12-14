FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_LINK_MODE=copy

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir uv && \
    apt-get update && \
    apt-get install -y --no-install-recommends libzbar0 libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock* ./
RUN uv sync --no-dev --frozen || uv sync --no-dev

COPY . .
RUN uv sync --no-dev --frozen || uv sync --no-dev

COPY entrypoint.sh ./
CMD ["./entrypoint.sh"]
