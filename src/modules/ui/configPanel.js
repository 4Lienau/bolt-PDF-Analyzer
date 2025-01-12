function createConfigPanel(configManager, onConfigUpdate) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';
  
  panel.innerHTML = `
    <style>
      .config-panel {
        background: #f5f5f5;
        padding: 15px;
        margin: 15px 0;
        border-radius: 8px;
        border: 1px solid #ddd;
      }
      .config-panel h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
      }
      .config-field {
        margin-bottom: 10px;
      }
      .config-field label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      .config-field input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .config-field input:focus {
        outline: none;
        border-color: #4CAF50;
      }
      .config-save {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }
      .config-save:hover {
        background: #45a049;
      }
    </style>
    <h3>Configuration</h3>
    <div class="config-field">
      <label for="apiKey">Google Cloud Vision API Key:</label>
      <input type="password" id="apiKey" placeholder="Enter your API key" value="${configManager.get('apiKey') || ''}">
    </div>
    <div class="config-field">
      <label for="batchSize">Batch Size:</label>
      <input type="number" id="batchSize" min="1" max="10" value="${configManager.get('batchSize')}">
    </div>
    <button class="config-save">Save Configuration</button>
  `;

  const saveButton = panel.querySelector('.config-save');
  const apiKeyInput = panel.querySelector('#apiKey');
  const batchSizeInput = panel.querySelector('#batchSize');

  saveButton.addEventListener('click', () => {
    const newConfig = {
      apiKey: apiKeyInput.value,
      batchSize: parseInt(batchSizeInput.value) || 5
    };
    
    configManager.updateConfig(newConfig);
    onConfigUpdate(newConfig);
    alert('Configuration saved!');
  });

  return panel;
}

export { createConfigPanel };
