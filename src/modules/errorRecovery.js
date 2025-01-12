// Enhanced error recovery
export class ErrorRecovery {
  constructor(configManager) {
    this.configManager = configManager;
    this.errors = [];
    this.retryQueue = [];
  }

  addError(error, page) {
    this.errors.push({
      timestamp: new Date(),
      error,
      page,
      retryCount: 0
    });
    this.retryQueue.push(this.errors[this.errors.length - 1]);
  }

  async retryFailed(processFunction) {
    const maxRetries = this.configManager.get('retryAttempts');
    const results = [];

    while (this.retryQueue.length > 0) {
      const errorItem = this.retryQueue.shift();
      
      if (errorItem.retryCount >= maxRetries) {
        results.push({
          success: false,
          page: errorItem.page,
          error: new Error(`Max retry attempts (${maxRetries}) exceeded`)
        });
        continue;
      }

      try {
        errorItem.retryCount++;
        const result = await processFunction(errorItem.page);
        results.push({ success: true, page: errorItem.page });
      } catch (error) {
        console.error(`Retry failed for page ${errorItem.page.pageNum}:`, error);
        this.retryQueue.push(errorItem);
        results.push({ success: false, page: errorItem.page, error });
      }

      // Wait before next retry
      await new Promise(resolve => 
        setTimeout(resolve, this.configManager.get('retryDelay'))
      );
    }

    return results;
  }

  getErrorSummary() {
    return {
      total: this.errors.length,
      retryable: this.retryQueue.length,
      errors: this.errors.map(e => ({
        page: e.page.pageNum,
        message: e.error.message,
        retries: e.retryCount
      }))
    };
  }
}
