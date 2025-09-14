# EcoFlow Power Deck - StreamDeck Plugin

A StreamDeck plugin that displays real-time EcoFlow power generation, consumption, and net load data on your StreamDeck buttons.

## Features

- **Real-time Polling**: Automatically updates power data every 30 seconds (configurable)
- **Visual States**: Different button states for power generation vs consumption
- **Multiple Instances**: Support for multiple buttons showing the same data
- **Error Handling**: Displays connection errors on the button
- **Manual Refresh**: Press button to immediately update data
- **Compact Display**: Optimized format for StreamDeck button constraints

## Requirements

- StreamDeck software
- EcoFlow API server running (from the main ecoflow-api-simplifier project)
- Node.js 20+ for development

## Installation

### From Release (Recommended)
1. Download the latest `com.tomas-g.eco-power-deck.sdPlugin` file from releases
2. Double-click to install in StreamDeck software

### From Source
1. Clone this repository
2. Navigate to the `streamdeck-plugin` directory
3. Install dependencies: `npm install`
4. Build the plugin: `npm run build`
5. Double-click the generated `com.tomas-g.eco-power-deck.sdPlugin` folder to install

## Configuration

### API Server Setup
1. Make sure the EcoFlow API server is running (see main project README)
2. The server should be accessible at `http://localhost:3000` by default

### Plugin Settings
- **API Server URL**: URL of your EcoFlow API server (default: http://localhost:3000)
- **Poll Interval**: How often to update power data in seconds (default: 30, range: 5-300)

## Usage

1. Drag the "EcoFlow Power Status" action to a StreamDeck button
2. Configure the API server URL in the property inspector (if different from default)
3. Set your preferred polling interval
4. The button will show:
   - ☀️ XX.X W - Solar generation
   - 🔌 XX.X W - Power consumption
   - ⚡ XX.X W - Net load (positive = consuming, negative = generating surplus)

### Button States
- **Green State**: Generating surplus power (feeding back to grid)
- **Red State**: Consuming power from grid or not generating

### Error States
The button will display error messages if:
- API server is offline: "API Server Offline"
- Connection timeout: "API Timeout"
- Network issues: "Connection Error"

## Display Format

The button displays power data in a compact format:
```
☀️45.0W    (Solar generation)
🔌35.0W    (Total consumption)
⚡-10.0W   (Net load: negative = surplus)
```

## Development

### Building
```bash
npm install
npm run build
```

### Development Mode
```bash
npm run dev  # Watch mode for TypeScript compilation
```

### Project Structure
```
streamdeck-plugin/
├── src/
│   ├── plugin.ts              # Main plugin entry point
│   ├── actions/
│   │   └── eco-power-action.ts # Main action implementation
│   └── api/
│       └── ecoflow-client.ts   # API client for EcoFlow server
├── com.tomas-g.eco-power-deck.sdPlugin/
│   ├── manifest.json           # Plugin manifest
│   ├── bin/                    # Compiled JavaScript
│   ├── imgs/                   # Button images
│   └── ui/                     # Property inspector UI
└── package.json
```

## API Integration

This plugin connects to the EcoFlow API server provided in the main project. The server should provide:

- `GET /health` - Health check endpoint
- `GET /power-status` - Power status data endpoint

Expected power status response format:
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-01-01T12:00:00.000Z",
    "generation": { "current": 450, "unit": "W" },
    "consumption": { "total": 350, "unit": "W" },
    "summary": {
      "netLoad": -100,
      "isGenerating": true,
      "isConsuming": true,
      "unit": "W"
    }
  }
}
```

## Troubleshooting

### Plugin Not Loading
- Check StreamDeck software logs
- Ensure Node.js 20+ is installed
- Verify plugin was built successfully

### Connection Errors
- Verify EcoFlow API server is running
- Check API server URL in plugin settings
- Test API endpoints manually with curl

### No Data Updates
- Check polling interval settings
- Verify API server has valid EcoFlow credentials
- Check network connectivity to EcoFlow services

## License

MIT License - see main project for details.