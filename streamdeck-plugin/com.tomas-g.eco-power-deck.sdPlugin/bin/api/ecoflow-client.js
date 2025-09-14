"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoFlowClient = void 0;
const axios_1 = __importDefault(require("axios"));
class EcoFlowClient {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
    }
    async getPowerStatus() {
        var _a, _b, _c;
        try {
            const response = await axios_1.default.get(`${this.baseURL}/power-status`, {
                timeout: 10000, // 10 second timeout
            });
            if (!response.data.success) {
                throw new Error(((_a = response.data.error) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to get power status');
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Cannot connect to EcoFlow API server');
                }
                if (error.response) {
                    throw new Error(`API Error: ${error.response.status} - ${((_c = (_b = error.response.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) || error.message}`);
                }
                if (error.request) {
                    throw new Error('No response from EcoFlow API server');
                }
            }
            throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async checkHealth() {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/health`, {
                timeout: 5000,
            });
            return response.data.status === 'healthy';
        }
        catch (error) {
            return false;
        }
    }
}
exports.EcoFlowClient = EcoFlowClient;
