import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { jsPDF } from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const worker = await createWorker();
let extractedPages = [];
let loadedPdf = null;

const analyzeBtn = document.getElementById('analyzeBtn');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');

document.getElementById('pdfInput').addEventListener('change', handleFileSelect);
analyzeBtn.addEventListener('click', analyzePDF);
processBtn.addEventListener('click', processPDF);
downloadBtn.addEventListener('click', createNewPDF);

async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    resetUI();
    updateStatus('Loading PDF...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      updateStatus(`PDF loaded. Total pages: ${loadedPdf.numPages}`);
      analyzeBtn.style.display = 'block';
    } catch (error) {
      updateStatus('Error loading PDF: ' + error.message);
    }
  }
}

async function analyzePDF() {
  if (!loadedPdf) return;
  
  analyzeBtn.disabled = true;
  updateStatus('Extracting pages...');
  extractedPages = [];
  
  try {
    for (let i = 1; i <= loadedPdf.numPages; i++) {
      updateStatus(`Extracting page ${i}/${loadedPdf.numPages}`);
      const page = await loadedPdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      extractedPages.push({
        pageNum: i,
        canvas: canvas,
        number: null
      });

      // Show preview of extracted page
      const preview = document.getElementById('preview');
      const pageDiv = document.createElement('div');
      pageDiv.innerHTML = `<h3>Page ${i}</h3>`;
      pageDiv.appendChild(canvas.cloneNode(true));
      preview.appendChild(pageDiv);
    }
    
    updateStatus('Pages extracted. Click Process to perform OCR.');
    processBtn.style.display = 'block';
  } catch (error) {
    updateStatus('Error analyzing PDF: ' + error.message);
  } finally {
    analyzeBtn.disabled = false;
  }
}

async function processPDF() {
  processBtn.disabled = true;
  updateStatus('Processing pages with OCR...');
  
  try {
    for (let i = 0; i < extractedPages.length; i++) {
      updateStatus(`Processing page ${i + 1}/${extractedPages.length}`);
      const { data: { text } } = await worker.recognize(extractedPages[i].canvas);
      
      // Extract numbers from text
      const numbers = text.match(/\d+/g);
      if (numbers) {
        extractedPages[i].number = parseInt(numbers[0]);
      }
    }

    // Sort pages by extracted numbers
    extractedPages.sort((a, b) => {
      if (a.number === null) return 1;
      if (b.number === null) return -1;
      return a.number - b.number;
    });

    updateStatus('Processing complete. Pages reordered.');
    downloadBtn.style.display = 'block';
    
    // Update preview with reordered pages
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    extractedPages.forEach((page, index) => {
      const div = document.createElement('div');
      div.innerHTML = `<h3>Page ${index + 1} (Number: ${page.number || 'Not found'})</h3>`;
      div.appendChild(page.canvas.cloneNode(true));
      preview.appendChild(div);
    });
  } catch (error) {
    updateStatus('Error processing PDF: ' + error.message);
  } finally {
    processBtn.disabled = false;
  }
}

async function createNewPDF() {
  updateStatus('Creating new PDF...');
  downloadBtn.disabled = true;
  
  try {
    const pdf = new jsPDF();
    
    extractedPages.forEach((page, index) => {
      if (index > 0) pdf.addPage();
      const imgData = page.canvas.toDataURL('image/jpeg', 0.75);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    });
    
    pdf.save('reordered.pdf');
    updateStatus('New PDF created and downloaded.');
  } catch (error) {
    updateStatus('Error creating PDF: ' + error.message);
  } finally {
    downloadBtn.disabled = false;
  }
}

function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

function resetUI() {
  document.getElementById('preview').innerHTML = '';
  processBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
  analyzeBtn.style.display = 'none';
  analyzeBtn.disabled = false;
  processBtn.disabled = false;
  downloadBtn.disabled = false;
}
