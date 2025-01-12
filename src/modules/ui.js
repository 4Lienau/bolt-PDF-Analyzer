export function updatePagePreview(index, page, preview) {
  let pageDiv = document.getElementById(`page-${index}`);
  if (!pageDiv) {
    pageDiv = document.createElement('div');
    pageDiv.id = `page-${index}`;
    pageDiv.className = 'page-info';
    preview.appendChild(pageDiv);
  }

  pageDiv.innerHTML = `
    <h3>Page ${page.pageNum}</h3>
    <div style="margin-bottom: 10px">
      <strong>Original Page Number:</strong> ${page.pageNum}<br>
      <strong>Extracted Number:</strong> ${page.number !== null ? page.number : 'Not found'}<br>
      <strong>Status:</strong> ${page.text ? 'OCR Complete' : 'Processing'}<br>
      <strong>Time:</strong> ${new Date().toLocaleTimeString()}
    </div>
    ${page.text ? `
      <div style="margin-bottom: 10px">
        <strong>Raw OCR Text:</strong>
        <pre style="background: #f5f5f5; padding: 10px; white-space: pre-wrap;">${page.text}</pre>
      </div>
    ` : ''}
    <div>
      <p><strong>Original Image:</strong></p>
      <img src="${page.canvas.toDataURL()}" alt="Original" style="max-width: 300px;">
    </div>
  `;
}

export function showProcessingSummary(pages, preview) {
  const summaryDiv = document.createElement('div');
  summaryDiv.style.padding = '20px';
  summaryDiv.style.margin = '20px 0';
  summaryDiv.style.backgroundColor = '#f0f0f0';
  
  const numbersFound = pages.filter(page => page.number !== null).length;
  const numbersList = pages
    .map((page, index) => 
      `${index + 1}. Number: ${page.number || 'Not found'} (Original page: ${page.pageNum})`
    )
    .join('\n');

  summaryDiv.innerHTML = `
    <h2>Processing Summary</h2>
    <p><strong>Total Pages:</strong> ${pages.length}</p>
    <p><strong>Numbers Found:</strong> ${numbersFound}</p>
    <p><strong>Pages Without Numbers:</strong> ${pages.length - numbersFound}</p>
    <p><strong>Sort Order:</strong></p>
    <pre style="background: #fff; padding: 10px;">${numbersList}</pre>
  `;
  
  preview.insertBefore(summaryDiv, preview.firstChild);
}
