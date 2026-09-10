FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt ./
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

COPY . .
ENV PORT=8000
EXPOSE 8000
# Waitress is included in requirements.txt and works on every supported host.
# Render supplies PORT at runtime; do not hard-code a service port here.
CMD ["sh", "-c", "waitress-serve --host=0.0.0.0 --port=${PORT} server:app"]
