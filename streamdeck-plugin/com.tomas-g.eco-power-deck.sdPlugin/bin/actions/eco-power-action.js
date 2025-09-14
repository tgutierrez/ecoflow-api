"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoPowerAction = void 0;
const streamdeck_1 = __importStar(require("@elgato/streamdeck"));
const ecoflow_client_1 = require("../api/ecoflow-client");
class EcoPowerAction extends streamdeck_1.SingletonAction {
    constructor() {
        super();
        this.manifestId = "com.tomas-g.eco-power-deck.eco-power";
        this.pollInterval = null;
        this.activeActions = new Map();
        this.defaultPollIntervalMs = 30000; // 30 seconds
        // Initialize with default localhost API URL
        this.client = new ecoflow_client_1.EcoFlowClient();
        streamdeck_1.default.logger.info("EcoPowerAction initialized");
    }
    /**
     * Called when the action appears on the Stream Deck
     */
    async onWillAppear(ev) {
        streamdeck_1.default.logger.info(`Action appeared on context: ${ev.action.id}`);
        // Update client with settings if provided
        const settings = ev.payload.settings;
        if (settings === null || settings === void 0 ? void 0 : settings.apiBaseUrl) {
            this.client = new ecoflow_client_1.EcoFlowClient(settings.apiBaseUrl);
            streamdeck_1.default.logger.info(`Updated API URL to: ${settings.apiBaseUrl}`);
        }
        this.activeActions.set(ev.action.id, ev.action);
        // Start polling if this is the first active action
        if (this.activeActions.size === 1) {
            const pollInterval = (settings === null || settings === void 0 ? void 0 : settings.pollInterval) || this.defaultPollIntervalMs;
            this.startPolling(pollInterval);
        }
        // Get initial data
        await this.updatePowerData(ev.action);
    }
    /**
     * Called when the action disappears from the Stream Deck
     */
    async onWillDisappear(ev) {
        streamdeck_1.default.logger.info(`Action disappeared from context: ${ev.action.id}`);
        this.activeActions.delete(ev.action.id);
        // Stop polling if no more active actions
        if (this.activeActions.size === 0) {
            this.stopPolling();
        }
    }
    /**
     * Called when the key is pressed
     */
    async onKeyDown(ev) {
        streamdeck_1.default.logger.info(`Key pressed on context: ${ev.action.id}`);
        // Refresh data immediately when pressed
        await this.updatePowerData(ev.action);
    }
    /**
     * Start polling for power data
     */
    startPolling(intervalMs = this.defaultPollIntervalMs) {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        this.pollInterval = setInterval(async () => {
            streamdeck_1.default.logger.debug(`Polling power data for ${this.activeActions.size} actions`);
            for (const [actionId, action] of this.activeActions) {
                await this.updatePowerData(action);
            }
        }, intervalMs);
        streamdeck_1.default.logger.info(`Started EcoFlow power polling every ${intervalMs / 1000} seconds`);
    }
    /**
     * Stop polling for power data
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        streamdeck_1.default.logger.info("Stopped EcoFlow power polling");
    }
    /**
     * Update power data for a specific action
     */
    async updatePowerData(action) {
        try {
            streamdeck_1.default.logger.debug(`Updating power data for action: ${action.id}`);
            const powerStatus = await this.client.getPowerStatus();
            // Update the button title with power info
            const title = this.formatPowerDisplay(powerStatus);
            await action.setTitle(title);
            // Update the button state based on generation/consumption
            const state = this.determineButtonState(powerStatus);
            await action.setState(state);
            streamdeck_1.default.logger.debug(`Updated power data: Gen=${powerStatus.generation.current}W, ` +
                `Load=${powerStatus.consumption.total}W, Net=${powerStatus.summary.netLoad}W`);
        }
        catch (error) {
            streamdeck_1.default.logger.error(`Failed to get power status: ${error}`);
            // Display error on button
            const errorMessage = this.getErrorMessage(error);
            await action.setTitle(errorMessage);
            // Set to error state (state 0)
            await action.setState(0);
        }
    }
    /**
     * Format power data for display on Stream Deck button
     */
    formatPowerDisplay(powerStatus) {
        // Convert from deciWatts to Watts and format
        const gen = (powerStatus.generation.current / 10).toFixed(1);
        const load = (powerStatus.consumption.total / 10).toFixed(1);
        const net = (powerStatus.summary.netLoad / 10).toFixed(1);
        // Format for Stream Deck display (limited characters)
        // Use compact symbols and format
        return `☀️${gen}W\n🔌${load}W\n⚡${net}W`;
    }
    /**
     * Determine button state based on power status
     */
    determineButtonState(powerStatus) {
        // State 1: Generating surplus power (green/good state)
        if (powerStatus.summary.isGenerating && powerStatus.summary.netLoad < 0) {
            return 1;
        }
        // State 0: Consuming power or no generation (red/warning state)
        return 0;
    }
    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        const errorStr = error instanceof Error ? error.message : String(error);
        if (errorStr.includes('ECONNREFUSED') || errorStr.includes('Cannot connect')) {
            return "API\nServer\nOffline";
        }
        if (errorStr.includes('timeout')) {
            return "API\nTimeout";
        }
        if (errorStr.includes('No response')) {
            return "No\nResponse";
        }
        // Generic error - keep it short for button display
        return "Connection\nError";
    }
}
exports.EcoPowerAction = EcoPowerAction;
