// Default configuration
const defaultConfig = {
  apiKey: '',
  apiEndpoint: 'https://vision.googleapis.com/v1/images:annotate',
  batchSize: 5,
  retryAttempts: 3,
  retryDelay: 2000,
  rateLimitDelay: 1000,
};

class ConfigManager {
  constructor() {
    this.config = { ...defaultConfig };
    this.loadConfig();
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('ocrConfig');
      if (savedConfig) {
        this.config = { ...defaultConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  saveConfig() {
    try {
      localStorage.setItem('ocrConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  get(key) {
    return this.config[key];
  }
}

export const configManager = new ConfigManager();
