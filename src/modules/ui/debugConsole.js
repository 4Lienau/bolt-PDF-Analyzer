export class DebugConsole {
  constructor(container) {
    this.container = container;
    this.maxLogs = 100; // Maximum number of logs to keep
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logElement = document.createElement('div');
    logElement.className = `log ${type}`;
    logElement.innerHTML = `
      <span class="timestamp">[${timestamp}]</span>
      ${this.escapeHtml(message)}
    `;
    
    this.container.appendChild(logElement);
    this.container.scrollTop = this.container.scrollHeight;

    // Remove old logs if exceeding maxLogs
    while (this.container.children.length > this.maxLogs) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  info(message) {
    this.log(message, 'info');
  }

  success(message) {
    this.log(message, 'success');
  }

  error(message) {
    this.log(message, 'error');
  }

  clear() {
    this.container.innerHTML = '';
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
