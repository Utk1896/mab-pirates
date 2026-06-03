FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy full project
COPY . .

# Ensure uploads dir exists inside the image
RUN mkdir -p /app/uploads

# Expose default port (Render overrides via $PORT)
EXPOSE 8080

# Start uvicorn — Render sets $PORT automatically
CMD ["sh", "-c", "cd /app/backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
