#!/bin/bash
set -e

echo "🚀 Starting Casciz Commerce OS..."
echo ""

# Create .env if missing
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
fi

echo "🐘 Starting PostgreSQL..."
docker compose up -d postgres
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

echo "🔴 Starting Redis..."
docker compose up -d redis
sleep 5

echo "🔨 Building and starting all services..."
echo "   (This takes 10-15 minutes the first time)"
echo ""
docker compose up --build -d

echo ""
echo "⏳ Waiting for all services to start..."
sleep 30

echo ""
echo "✅ Checking status..."
docker compose ps

echo ""
echo "🎉 Casciz Commerce OS is starting!"
echo ""
echo "Open your browser: http://localhost"
echo "Register here:     http://localhost/register"
echo "API docs:          http://localhost:8080/swagger-ui.html"
echo ""
echo "📋 To see logs: docker compose logs -f"
echo "🛑 To stop:     docker compose down"
