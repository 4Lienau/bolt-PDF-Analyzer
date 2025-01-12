// Import required modules
import { configManager } from './modules/config.js';
import { ProgressTracker } from './modules/ui/progressBar.js';
import { ErrorRecovery } from './modules/errorRecovery.js';
import { initializeApp } from './modules/init.js';
import { loadPDFFile, extractPage } from './modules/pdfLoader.js';
import { BatchProcessor } from './modules/batchProcessor.js';
import { generatePDF } from './modules/pdf.js';
import { updatePagePreview, showProcessingSummary } from './modules/ui.js';
import { DebugConsole } from './modules/ui/debugConsole.js';
import { Logger } from './modules/logger.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const elements = {
    pdfInput: document.getElementById('pdfInput'),
    pageLimitInput: document.getElementById('pageLimit'),
    processBtn: document.getElementById('processBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    statusDiv: document.getElementById('status'),
    preview: document.getElementById('preview'),
    totalPagesSpan: document.getElementById('totalPages'),
    progressFill: document.querySelector('.progress-fill'),
    debugConsole: document.getElementById('debugConsole')
  };

  // Initialize utilities
  const logger = new Logger();
  const debugConsole = new DebugConsole(elements.debugConsole);

  // Initialize state
  const state = {
    loadedPdf: null,
    processedPages: [],
    errorRecovery: new ErrorRecovery(configManager)
  };

  // Update progress bar
  function updateProgressBar(percent) {
    elements.progressFill.style.width = `${percent}%`;
  }

  // Update status
  function updateStatus(message) {
    console.log('Status:', message);
    elements.statusDiv.textContent = message;
  }

  // Setup UI initial state
  function setupUI() {
    elements.pageLimitInput.value = "0";
    elements.processBtn.disabled = true;
    elements.downloadBtn.disabled = true;
    elements.totalPagesSpan.textContent = '-';
    updateStatus('Select a PDF file to begin');
  }

  // Initialize the application
  async function init() {
    const pdfjsLib = await initializeApp();
    setupUI();
    
    debugConsole.info('PDF.js initialized successfully');
    logger.info('Application initialized');

    // File input handler
    elements.pdfInput.addEventListener('change', async (e) => {
      if (e.target.files.length === 0) {
        elements.processBtn.disabled = true;
        elements.totalPagesSpan.textContent = '-';
        updateStatus('Select a PDF file to begin');
        return;
      }
      
      try {
        const file = e.target.files[0];
        debugConsole.info(`Loading PDF: ${file.name}`);
        logger.info(`Loading PDF file: ${file.name}`, { fileName: file.name, fileSize: file.size });
        
        const pagesToProcess = await loadPDFFile(file, pdfjsLib, elements, state);
        elements.processBtn.disabled = false;
        const message = `Ready to process ${pagesToProcess} pages`;
        updateStatus(message);
        debugConsole.success(`PDF loaded successfully: ${pagesToProcess} pages`);
        logger.success(message, { totalPages: pagesToProcess });
      } catch (error) {
        console.error('Error loading PDF:', error);
        debugConsole.error(`Failed to load PDF: ${error.message}`);
        logger.error('Failed to load PDF', { error: error.message, stack: error.stack });
        updateStatus('Error loading PDF file');
        elements.processBtn.disabled = true;
        elements.totalPagesSpan.textContent = '-';
      }
    });

    // Process button handler
    elements.processBtn.addEventListener('click', async () => {
      if (!state.loadedPdf) return;
      
      elements.processBtn.disabled = true;
      elements.downloadBtn.disabled = true;
      elements.preview.innerHTML = '';
      updateProgressBar(0);
      debugConsole.clear();
      logger.clear();
      
      debugConsole.info('Starting PDF processing');
      logger.info('Starting PDF processing', {
        totalPages: state.loadedPdf.numPages,
        pageLimit: elements.pageLimitInput.value
      });
      
      const pageLimit = parseInt(elements.pageLimitInput.value) || state.loadedPdf.numPages;
      const pagesToProcess = Math.min(pageLimit, state.loadedPdf.numPages);
      
      try {
        state.processedPages = [];
        for (let i = 1; i <= pagesToProcess; i++) {
          debugConsole.info(`Extracting page ${i}/${pagesToProcess}`);
          logger.info(`Extracting page ${i}/${pagesToProcess}`);
          const canvas = await extractPage(i, state.loadedPdf);
          state.processedPages.push({
            pageNum: i,
            canvas: canvas,
            text: null,
            number: null
          });
        }

        const batchProcessor = new BatchProcessor(
          (status, progress) => {
            updateStatus(status);
            updateProgressBar(progress);
            debugConsole.info(status);
            logger.info(status);
          },
          (index, page) => {
            updatePagePreview(index, page, elements.preview);
            if (page.number !== null) {
              const message = `Page ${page.pageNum}: Extracted number ${page.number}`;
              debugConsole.success(message);
              logger.success(message, {
                pageNum: page.pageNum,
                extractedNumber: page.number,
                rawText: page.text
              });
            } else {
              const message = `Page ${page.pageNum}: Failed to extract number`;
              debugConsole.error(message);
              logger.error(message, {
                pageNum: page.pageNum,
                rawText: page.text
              });
            }
          }
        );

        const result = await batchProcessor.processAllPages(state.processedPages);
        
        // Count successfully processed pages (pages with valid numbers)
        const successfulPages = state.processedPages.filter(page => page.number !== null);
        
        if (successfulPages.length > 0) {
          // Sort pages by extracted number
          state.processedPages.sort((a, b) => {
            if (a.number === null && b.number === null) return 0;
            if (a.number === null) return 1;
            if (b.number === null) return -1;
            return a.number - b.number;
          });

          showProcessingSummary(state.processedPages, elements.preview);
          elements.downloadBtn.disabled = false;
          
          const statusMessage = result.errors.length > 0
            ? `Processing complete with ${result.errors.length} errors. Successfully processed ${successfulPages.length} pages.`
            : `Processing complete! All ${successfulPages.length} pages processed successfully.`;
          
          updateStatus(statusMessage + ' Click Download to get the reordered PDF.');
          debugConsole.success(statusMessage);
          logger.success(statusMessage, {
            totalPages: pagesToProcess,
            successfulPages: successfulPages.length,
            errors: result.errors.length,
            pageOrder: state.processedPages.map(p => ({ 
              pageNum: p.pageNum, 
              extractedNumber: p.number 
            }))
          });

          // Add download log button
          const logButton = document.createElement('button');
          logButton.className = 'button';
          logButton.style.marginLeft = '10px';
          logButton.textContent = 'Download Log';
          logButton.onclick = () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            logger.downloadLog(`ocr-processing-log-${timestamp}.txt`);
          };
          elements.downloadBtn.parentNode.appendChild(logButton);
        } else {
          elements.downloadBtn.disabled = true;
          const message = 'Processing failed: No valid page numbers were extracted.';
          updateStatus(message);
          debugConsole.error(message);
          logger.error(message);
        }
      } catch (error) {
        console.error('Processing error:', error);
        debugConsole.error(`Processing error: ${error.message}`);
        logger.error('Processing error', { error: error.message, stack: error.stack });
        updateStatus('Error processing PDF: ' + error.message);
        elements.processBtn.disabled = false;
      }
    });

    // Download button handler
    elements.downloadBtn.addEventListener('click', async () => {
      try {
        const message = 'Generating PDF...';
        updateStatus(message);
        debugConsole.info(message);
        logger.info(message);

        const pdf = await generatePDF(state.processedPages);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        pdf.save(`reordered-${timestamp}.pdf`);
        
        const successMessage = 'PDF downloaded successfully!';
        updateStatus(successMessage);
        debugConsole.success(successMessage);
        logger.success(successMessage);
      } catch (error) {
        console.error('Error generating PDF:', error);
        const errorMessage = 'Error generating PDF: ' + error.message;
        updateStatus(errorMessage);
        debugConsole.error(errorMessage);
        logger.error('PDF generation error', { error: error.message, stack: error.stack });
      }
    });
  }

  // Start the application
  init().catch(error => {
    console.error('Initialization error:', error);
    debugConsole.error(`Initialization error: ${error.message}`);
    logger.error('Initialization error', { error: error.message, stack: error.stack });
  });
});
