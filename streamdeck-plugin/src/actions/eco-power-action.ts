import streamDeck, { KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, Action } from "@elgato/streamdeck";
import { EcoFlowClient, PowerStatus } from "../api/ecoflow-client";

interface EcoPowerSettings {
  pollInterval?: number;
  apiBaseUrl?: string;
}

export class EcoPowerAction extends SingletonAction<EcoPowerSettings> {
  public readonly manifestId = "com.tomas-g.eco-power-deck.eco-power";
  
  private client: EcoFlowClient;
  private pollInterval: NodeJS.Timeout | null = null;
  private activeActions: Map<string, Action<EcoPowerSettings>> = new Map();
  private readonly defaultPollIntervalMs = 30000; // 30 seconds

  constructor() {
    super();
    // Initialize with default localhost API URL
    this.client = new EcoFlowClient();
    streamDeck.logger.info("EcoPowerAction initialized");
  }

  /**
   * Called when the action appears on the Stream Deck
   */
  override async onWillAppear(ev: WillAppearEvent<EcoPowerSettings>): Promise<void> {
    streamDeck.logger.info(`Action appeared on context: ${ev.action.id}`);
    
    // Update client with settings if provided
    const settings = ev.payload.settings;
    if (settings?.apiBaseUrl) {
      this.client = new EcoFlowClient(settings.apiBaseUrl);
      streamDeck.logger.info(`Updated API URL to: ${settings.apiBaseUrl}`);
    }

    this.activeActions.set(ev.action.id, ev.action);
    
    // Start polling if this is the first active action
    if (this.activeActions.size === 1) {
      const pollInterval = settings?.pollInterval || this.defaultPollIntervalMs;
      this.startPolling(pollInterval);
    }

    // Get initial data
    await this.updatePowerData(ev.action);
  }

  /**
   * Called when the action disappears from the Stream Deck
   */
  override async onWillDisappear(ev: WillDisappearEvent<EcoPowerSettings>): Promise<void> {
    streamDeck.logger.info(`Action disappeared from context: ${ev.action.id}`);
    
    this.activeActions.delete(ev.action.id);
    
    // Stop polling if no more active actions
    if (this.activeActions.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Called when the key is pressed
   */
  override async onKeyDown(ev: KeyDownEvent<EcoPowerSettings>): Promise<void> {
    streamDeck.logger.info(`Key pressed on context: ${ev.action.id}`);
    
    // Refresh data immediately when pressed
    await this.updatePowerData(ev.action);
  }

  /**
   * Start polling for power data
   */
  private startPolling(intervalMs: number = this.defaultPollIntervalMs): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.pollInterval = setInterval(async () => {
      streamDeck.logger.debug(`Polling power data for ${this.activeActions.size} actions`);
      
      for (const [actionId, action] of this.activeActions) {
        await this.updatePowerData(action);
      }
    }, intervalMs);

    streamDeck.logger.info(`Started EcoFlow power polling every ${intervalMs/1000} seconds`);
  }

  /**
   * Stop polling for power data
   */
  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    streamDeck.logger.info("Stopped EcoFlow power polling");
  }

  /**
   * Update power data for a specific action
   */
  private async updatePowerData(action: Action<EcoPowerSettings>): Promise<void> {
    try {
      streamDeck.logger.debug(`Updating power data for action: ${action.id}`);
      
      const powerStatus = await this.client.getPowerStatus();
      
      // Update the button title with power info
      const title = this.formatPowerDisplay(powerStatus);
      await action.setTitle(title);

      // Update the button state based on generation/consumption
      const state = this.determineButtonState(powerStatus);
      await action.setState(state);

      streamDeck.logger.debug(
        `Updated power data: Gen=${powerStatus.generation.current}W, ` +
        `Load=${powerStatus.consumption.total}W, Net=${powerStatus.summary.netLoad}W`
      );

    } catch (error) {
      streamDeck.logger.error(`Failed to get power status: ${error}`);
      
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
  private formatPowerDisplay(powerStatus: PowerStatus): string {
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
  private determineButtonState(powerStatus: PowerStatus): 0 | 1 {
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
  private getErrorMessage(error: any): string {
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