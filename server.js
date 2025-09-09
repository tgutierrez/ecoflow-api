const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const EcoFlowAPI = require('./app');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Root endpoint with API info
app.get('/', (req, res) => {
    res.json({
        name: 'EcoFlow Home Automation API',
        version: '1.0.0',
        description: 'Internal API for EcoFlow PowerStream and Smart Plug monitoring',
        endpoints: {
            '/': 'API information',
            '/health': 'Health check',
            '/power-status': 'Get current power generation and consumption data',
            '/devices': 'List all devices',
            '/devices/:sn/quota': 'Get device quota information'
        },
        timestamp: new Date().toISOString()
    });
});

// Main endpoint - Get power status
app.get('/power-status', async (req, res) => {
    try {
        const ecoflow = new EcoFlowAPI();
        const powerStatus = await ecoflow.getPowerStatus();
        
        res.json({
            success: true,
            data: powerStatus
        });
    } catch (error) {
        console.error('Error getting power status:', error.message);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Get devices list
app.get('/devices', async (req, res) => {
    try {
        const ecoflow = new EcoFlowAPI();
        const devices = await ecoflow.getDevices();
        
        res.json({
            success: true,
            data: devices
        });
    } catch (error) {
        console.error('Error getting devices:', error.message);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                timestamp: new Date().toISOString()
            }
        });
    }
});


// Get specific device quota
app.get('/devices/:sn/quotas', async (req, res) => {
    try {
        const { sn } = req.params;
        const { values = '' } = req.query;
        const quotaArray = values ? values.split(',').map(q => q.trim()) : [];

        const ecoflow = new EcoFlowAPI();

        let deviceData = quotaArray.length > 0 ? await ecoflow.getDeviceQuotas(sn, quotaArray) : await ecoflow.getDeviceAllQuotas(sn);

        res.json({
            success: true,
            data: deviceData
        });
    } catch (error) {
        console.error(`Error getting device quota for ${req.params.sn}:`, error.message);
        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            timestamp: new Date().toISOString()
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Endpoint not found',
            path: req.path,
            timestamp: new Date().toISOString()
        }
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EcoFlow API Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`⚡ Power status: http://localhost:${PORT}/power-status`);
    console.log(`🏠 Home automation ready!`);
});

module.exports = app;
