// Cloud Vision OCR implementation
export async function performCloudVisionOCR(imageBase64) {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Image = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: base64Image
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
  } catch (error) {
    console.error('Cloud Vision API error:', error);
    throw error;
  }
}

export function extractNumber(text) {
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
