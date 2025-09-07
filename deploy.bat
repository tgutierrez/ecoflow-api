@echo off
REM EcoFlow API Deployment Script for Windows
REM This script helps deploy the EcoFlow Home Automation API

echo 🚀 Starting EcoFlow API Deployment...

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found!
    echo 📋 Please copy .env.example to .env and configure your credentials:
    echo    copy .env.example .env
    echo    REM Edit .env with your EcoFlow API credentials
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running!
    echo 📋 Please start Docker and try again.
    exit /b 1
)

REM Build and start the application
echo 🔨 Building Docker image...
docker-compose build

echo 🏃 Starting EcoFlow API...
docker-compose up -d

REM Wait for the service to be ready
echo ⏳ Waiting for service to be ready...
timeout /t 10 >nul

REM Check if the service is healthy
echo 🔍 Checking service health...
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ EcoFlow API is running successfully!
    echo.
    echo 📡 Available endpoints:
    echo    Health Check:  http://localhost:3000/health
    echo    API Info:      http://localhost:3000/
    echo    Power Status:  http://localhost:3000/power-status
    echo    Devices:       http://localhost:3000/devices
    echo.
    echo 🏠 Your home automation API is ready!
) else (
    echo ❌ Service health check failed!
    echo 📋 Check logs with: docker-compose logs
    exit /b 1
)

pause
