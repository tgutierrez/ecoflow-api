# EcoFlow Home Automation API

A vibe coded Node.js web API for EcoFlow PowerStream and Smart Plug monitoring, designed for home automation systems.

## ✅ Features

- 🌐 **RESTful Web API**: Browser-accessible endpoints for home automation
- 🔐 **Secure Authentication**: EcoFlow API signature validation
- 📊 **Real-time Data**: Power generation, consumption, and device status
- 🐳 **Containerized**: Docker and Docker Compose ready
- 🏥 **Health Monitoring**: Built-in health checks and monitoring
- 🔒 **Production Security**: Helmet, CORS, and security best practices
- 📱 **Home Automation Ready**: JSON responses perfect for automation systems

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- EcoFlow Developer Account with API credentials

### 1. Clone and Setup
```bash
git clone <your-repo>
cd ecoflow-api
cp .env.example .env
# Edit .env with your EcoFlow credentials
```

### 2. Deploy with Docker (Recommended)
```bash
# Windows
./deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### 3. Manual Deployment
```bash
npm install
npm start
```

## � API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and available endpoints |
| `/health` | GET | Health check for monitoring |
| `/power-status` | GET | **Main endpoint** - Complete power status |
| `/devices` | GET | List all EcoFlow devices |
| `/devices/:sn/quota` | GET | Device-specific quota data |

### Main Endpoint Response
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-09-06T10:30:00.000Z",
    "generation": {
      "current": 450,
      "unit": "W"
    },
    "consumption": {
      "reportedByInverter": 320,
      "permanentWatt": 200,
      "smartPlugs": 150,
      "total": 350,
      "unit": "W"
    },
    "inverter": {
      "outputLimit": 800,
      "serialNumber": "HW51...",
      "unit": "W"
    },
    "smartPlugs": [
      {
        "serialNumber": "HW52...",
        "consumption": 75,
        "unit": "W"
      }
    ],
    "summary": {
      "netLoad": -100,
      "isGenerating": true,
      "isConsuming": true,
      "unit": "W"
    }
  }
}
```

## 🏠 Home Automation Integration

Perfect for integration with:
- **StreamDeck**: Dedicated plugin for real-time power monitoring buttons
- **Home Assistant**: RESTful sensors
- **OpenHAB**: HTTP binding
- **Node-RED**: HTTP request nodes
- **Custom dashboards**: Direct API calls

### StreamDeck Plugin
A dedicated StreamDeck plugin is included in the `streamdeck-plugin/` directory:

```bash
cd streamdeck-plugin
npm install
npm run build
# Install the generated .sdPlugin folder in StreamDeck software
```

Features:
- Real-time power data on StreamDeck buttons
- Configurable polling intervals
- Visual states for generation vs consumption
- Error handling and connection status

See `streamdeck-plugin/README.md` for detailed setup instructions.

### Example Home Assistant Configuration
```yaml
sensor:
  - platform: rest
    resource: http://your-server:3000/power-status
    name: "EcoFlow Power Status"
    json_attributes_path: "$.data"
    json_attributes:
      - generation
      - consumption
      - summary
    value_template: "{{ value_json.data.summary.netLoad }}"
    unit_of_measurement: "W"
```

## � Configuration

### Environment Variables
```bash
# Required - EcoFlow API Credentials
ECOFLOW_ACCESS_KEY=your_access_key
ECOFLOW_SECRET_KEY=your_secret_key

# Optional - Configuration
ECOFLOW_BASE_URL=https://api-a.ecoflow.com/iot-open
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

## 🐳 Docker Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Docker Build
```bash
docker build -t ecoflow-api .
docker run -d --name ecoflow-api -p 3000:3000 --env-file .env ecoflow-api
```

### Health Monitoring
The container includes health checks accessible at:
- Container: `docker ps` shows health status
- HTTP: `GET /health` endpoint
- Logs: `docker-compose logs -f`

## 🛠️ Development

### Local Development
```bash
npm install
npm run dev  # Uses nodemon for auto-restart
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Power status
curl http://localhost:3000/power-status

# Device list
curl http://localhost:3000/devices
```

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Non-root user**: Container runs as non-privileged user
- **Resource limits**: Memory and CPU constraints
- **Input validation**: Request parameter validation

## � Monitoring & Logs

### Health Checks
- HTTP health endpoint: `/health`
- Docker health checks every 30s
- Startup grace period: 40s

### Logging
- Structured JSON logs
- Error tracking and reporting
- Request/response logging in development

## 🚀 Production Considerations

### Reverse Proxy Setup (Optional)
```nginx
server {
    listen 80;
    server_name ecoflow.local;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Resource Requirements
- **Memory**: 128MB minimum, 256MB limit
- **CPU**: 0.25 cores minimum, 0.5 cores limit
- **Storage**: ~50MB for image + logs
- **Network**: Outbound HTTPS to EcoFlow API

## 🔧 Troubleshooting

### Common Issues
1. **404 Errors**: Check EcoFlow API endpoints and credentials
2. **CORS Issues**: Add your domain to CORS settings
3. **Memory Issues**: Increase Docker memory limits
4. **Network Issues**: Verify outbound HTTPS access

### Debug Commands
```bash
# Check logs
docker-compose logs -f

# Check container health
docker ps

# Test API manually
curl -v http://localhost:3000/power-status

# Check environment variables
docker-compose exec ecoflow-api env | grep ECOFLOW
```

## 📝 Version History

- **v1.0.0**: Production-ready web API with Docker deployment
- **v0.1.0**: Initial CLI implementation with working signature authentication
