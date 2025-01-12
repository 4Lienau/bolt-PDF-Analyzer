// Configuration settings
export const config = {
  apiKey: 'YOUR_API_KEY',  // Replace with actual API key
  apiEndpoint: 'https://vision.googleapis.com/v1/images:annotate',
  batchSize: 5,            // Number of pages to process in parallel
  retryAttempts: 3,        // Number of retry attempts for failed requests
  retryDelay: 2000,        // Delay between retries in milliseconds
  rateLimitDelay: 1000,    // Delay between API calls in milliseconds
};
