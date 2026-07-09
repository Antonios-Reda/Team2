# ==========================
# Stage 1: Builder
# ==========================
# Build stage: Compile Python packages with C extensions
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies (only in builder stage)
# These are needed for compiling Python packages with C extensions
# (numpy, pandas, scikit-learn, tensorflow, pillow, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file early for layer caching
COPY requirements.txt .

# Install Python dependencies with BuildKit cache mount
# Cache persists between builds, speeds up rebuilds
# --no-cache-dir reduces image size by skipping pip's cache
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# ==========================
# Stage 2: Runtime
# ==========================
# Minimal runtime image - no build tools
FROM python:3.11-slim

WORKDIR /app

# إضافة المكتبات الأساسية للنظام
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/home/appuser/.local/bin:${PATH}"

RUN addgroup --system appuser && adduser --system --group appuser

COPY --from=builder /usr/local /usr/local
COPY --chown=appuser:appuser . .

RUN mkdir -p /app/models && chown -R appuser:appuser /app && chmod -R +x /usr/local/bin

USER appuser

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]

