export async function initializeApp() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
}

export function updateStatus(message, statusDiv) {
  console.log('Status:', message);
  statusDiv.textContent = message;
}
