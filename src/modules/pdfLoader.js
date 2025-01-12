// PDF loading and page extraction
export async function loadPDFFile(file, pdfjsLib, elements, state) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    state.loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    console.log('PDF loaded:', state.loadedPdf.numPages, 'pages');
    elements.totalPagesSpan.textContent = state.loadedPdf.numPages;
    elements.processBtn.disabled = false; // Enable the process button
    
    const pageLimit = parseInt(elements.pageLimitInput.value) || state.loadedPdf.numPages;
    const pagesToProcess = Math.min(pageLimit, state.loadedPdf.numPages);
    
    return pagesToProcess;
  } catch (error) {
    console.error('Error loading PDF:', error);
    elements.processBtn.disabled = true; // Ensure button is disabled on error
    throw error;
  }
}

export async function extractPage(pageNum, pdf) {
  try {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    return canvas;
  } catch (error) {
    console.error(`Error extracting page ${pageNum}:`, error);
    throw error;
  }
}
