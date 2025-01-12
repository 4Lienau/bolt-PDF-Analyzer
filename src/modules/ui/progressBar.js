// Enhanced progress visualization
export class ProgressTracker {
  constructor(container) {
    this.container = container;
    this.createElements();
  }

  createElements() {
    this.container.innerHTML = `
      <style>
        .progress-container {
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .progress-bar {
          height: 20px;
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s ease;
          width: 0%;
        }
        .progress-text {
          position: absolute;
          width: 100%;
          text-align: center;
          color: #000;
          line-height: 20px;
          font-size: 12px;
          font-weight: bold;
          text-shadow: 1px 1px 1px rgba(255,255,255,0.7);
        }
        .progress-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 0.9em;
        }
        .progress-error {
          color: #f44336;
          margin-top: 5px;
          font-size: 0.9em;
        }
      </style>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
          <div class="progress-text">0%</div>
        </div>
        <div class="progress-stats">
          <span class="progress-processed">Processed: 0/0</span>
          <span class="progress-success">Success: 0</span>
          <span class="progress-errors">Errors: 0</span>
        </div>
        <div class="progress-error"></div>
      </div>
    `;

    this.progressFill = this.container.querySelector('.progress-fill');
    this.progressText = this.container.querySelector('.progress-text');
    this.statsProcessed = this.container.querySelector('.progress-processed');
    this.statsSuccess = this.container.querySelector('.progress-success');
    this.statsErrors = this.container.querySelector('.progress-errors');
    this.errorContainer = this.container.querySelector('.progress-error');
  }

  update(processed, total, success, errors) {
    const percent = Math.round((processed / total) * 100);
    this.progressFill.style.width = `${percent}%`;
    this.progressText.textContent = `${percent}%`;
    this.statsProcessed.textContent = `Processed: ${processed}/${total}`;
    this.statsSuccess.textContent = `Success: ${success}`;
    this.statsErrors.textContent = `Errors: ${errors.length}`;

    if (errors.length > 0) {
      this.errorContainer.textContent = `Latest error: ${errors[errors.length - 1].message}`;
    }
  }

  reset() {
    this.update(0, 0, 0, []);
    this.errorContainer.textContent = '';
  }
}
