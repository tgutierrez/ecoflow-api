import axios from 'axios';

export interface PowerStatus {
  timestamp: string;
  generation: {
    current: number;
    unit: string;
  };
  consumption: {
    reportedByInverter: number;
    permanentWatt: number;
    smartPlugs: number;
    total: number;
    unit: string;
  };
  inverter: {
    outputLimit: number;
    serialNumber: string;
    unit: string;
  };
  smartPlugs: Array<{
    serialNumber: string;
    consumption: number;
    unit: string;
  }>;
  summary: {
    netLoad: number;
    isGenerating: boolean;
    isConsuming: boolean;
    unit: string;
    summaryMessage?: string;
  };
}

export class EcoFlowClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async getPowerStatus(): Promise<PowerStatus> {
    try {
      const response = await axios.get(`${this.baseURL}/power-status`, {
        timeout: 10000, // 10 second timeout
      });

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get power status');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to EcoFlow API server');
        }
        if (error.response) {
          throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`);
        }
        if (error.request) {
          throw new Error('No response from EcoFlow API server');
        }
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}