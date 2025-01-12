import { configManager } from './config.js';
import { performCloudVisionOCR, extractNumber } from './cloudVision.js';

export class BatchProcessor {
  constructor(updateStatus, updatePreview) {
    this.updateStatus = updateStatus;
    this.updatePreview = updatePreview;
    this.processed = 0;
    this.total = 0;
    this.errors = [];
  }

  async processBatch(pages, startIndex) {
    const batch = pages.slice(startIndex, startIndex + configManager.get('batchSize'));
    const results = await Promise.all(
      batch.map(async (page, index) => {
        const actualIndex = startIndex + index;
        try {
          const imageBase64 = page.canvas.toDataURL('image/jpeg', 0.75);
          const text = await performCloudVisionOCR(imageBase64);
          page.text = text.trim();
          page.number = extractNumber(page.text);
          
          this.processed++;
          this.updateProgress();
          this.updatePreview(actualIndex, page);
          
          return { success: true, page };
        } catch (error) {
          this.errors.push({ page, error });
          console.error(`Error processing page ${actualIndex + 1}:`, error);
          
          this.processed++;
          this.updateProgress();
          this.updatePreview(actualIndex, {
            ...page,
            text: `Error: ${error.message}`,
            number: null
          });
          
          return { success: false, page, error };
        }
      })
    );

    return results;
  }

  updateProgress() {
    const percent = Math.round((this.processed / this.total) * 100);
    const successCount = this.total - this.errors.length;
    this.updateStatus(
      `Processing pages: ${this.processed}/${this.total} (${percent}%) ` +
      `- Success: ${successCount} - Errors: ${this.errors.length}`,
      percent
    );
  }

  async processAllPages(pages) {
    this.total = pages.length;
    this.processed = 0;
    this.errors = [];

    for (let i = 0; i < pages.length; i += configManager.get('batchSize')) {
      await this.processBatch(pages, i);
      
      if (i + configManager.get('batchSize') < pages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: this.errors.length === 0,
      processed: this.processed,
      errors: this.errors,
      successCount: this.total - this.errors.length
    };
  }
}
