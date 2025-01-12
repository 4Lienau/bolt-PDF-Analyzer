import { configManager } from './config.js';

// Rate limiting implementation
class RateLimiter {
  constructor(delay) {
    this.delay = delay;
    this.lastCall = 0;
  }

  async waitForNext() {
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastCall + this.delay - now);
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    this.lastCall = Date.now();
  }
}

// Retry logic implementation
async function withRetry(fn, retryAttempts = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      if (attempt < retryAttempts - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, 2000 * Math.pow(2, attempt))
        );
      }
    }
  }
  
  throw lastError;
}

// Cloud Vision API call
const rateLimiter = new RateLimiter(1000);

async function callCloudVisionAPI(imageBase64) {
  await rateLimiter.waitForNext();
  
  const apiKey = configManager.get('apiKey');
  if (!apiKey) {
    throw new Error('Google Cloud Vision API key is not configured. Please set it in the configuration panel.');
  }

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        image: {
          content: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.responses[0].textAnnotations[0]?.description || '';
}

export async function performCloudVisionOCR(imageBase64) {
  return withRetry(async () => {
    return await callCloudVisionAPI(imageBase64);
  });
}

export function extractNumber(text) {
  if (!text) return null;
  
  console.log('Raw Vision API text:', text);
  
  // First try: Look for 400C- pattern
  const matches = text.match(/400C[-\s]*(\d+)/i);
  if (matches) {
    console.log('Found number via 400C pattern:', matches[1]);
    return parseInt(matches[1]);
  }

  // Second try: Look for any numbers with 2 or more digits
  const numbers = text.match(/\d{2,}/g);
  if (numbers) {
    const validNumbers = numbers
      .filter(num => num !== "400")
      .sort((a, b) => b.length - a.length);
    
    if (validNumbers.length > 0) {
      console.log('Found number via fallback:', validNumbers[0]);
      return parseInt(validNumbers[0]);
    }
  }

  console.log('No valid number found in text');
  return null;
}
