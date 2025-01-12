export class Logger {
  constructor() {
    this.logs = [];
  }

  log(message, type = 'info', data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    this.logs.push(logEntry);
    return logEntry;
  }

  info(message, data = null) {
    return this.log(message, 'info', data);
  }

  success(message, data = null) {
    return this.log(message, 'success', data);
  }

  error(message, data = null) {
    return this.log(message, 'error', data);
  }

  generateReport() {
    const report = this.logs.map(entry => {
      const timestamp = entry.timestamp;
      const prefix = `[${timestamp}] [${entry.type.toUpperCase()}]`;
      let message = `${prefix} ${entry.message}`;
      
      if (entry.data) {
        message += '\nData: ' + JSON.stringify(entry.data, null, 2);
      }
      
      return message;
    }).join('\n\n');

    return report;
  }

  downloadLog(filename = 'ocr-processing-log.txt') {
    const report = this.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clear() {
    this.logs = [];
  }
}
