// Image preprocessing for OCR
export function preprocessImage(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simpler preprocessing with darker output
  const contrast = 1.2;  // Reduced contrast
  const brightness = -20; // More negative for darker image
  const threshold = 120;  // Lower threshold for darker result

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    let value = avg * contrast + brightness;
    
    // Simple threshold
    value = value > threshold ? 255 : 0;
    
    data[i] = data[i + 1] = data[i + 2] = value;
  }

  const processedCanvas = document.createElement('canvas');
  processedCanvas.width = canvas.width;
  processedCanvas.height = canvas.height;
  const processedCtx = processedCanvas.getContext('2d');
  processedCtx.putImageData(imageData, 0, 0);

  return processedCanvas;
}
