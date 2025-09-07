#!/bin/bash

# EcoFlow API Deployment Script
# This script helps deploy the EcoFlow Home Automation API

echo "🚀 Starting EcoFlow API Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Please copy .env.example to .env and configure your credentials:"
    echo "   cp .env.example .env"
    echo "   # Edit .env with your EcoFlow API credentials"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "📋 Please start Docker and try again."
    exit 1
fi

# Build and start the application
echo "🔨 Building Docker image..."
docker-compose build

echo "🏃 Starting EcoFlow API..."
docker-compose up -d

# Wait for the service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Check if the service is healthy
echo "🔍 Checking service health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ EcoFlow API is running successfully!"
    echo ""
    echo "📡 Available endpoints:"
    echo "   Health Check:  http://localhost:3000/health"
    echo "   API Info:      http://localhost:3000/"
    echo "   Power Status:  http://localhost:3000/power-status"
    echo "   Devices:       http://localhost:3000/devices"
    echo ""
    echo "🏠 Your home automation API is ready!"
else
    echo "❌ Service health check failed!"
    echo "📋 Check logs with: docker-compose logs"
    exit 1
fi
