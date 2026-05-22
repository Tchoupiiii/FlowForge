export const execute = async (config, inputData) => {
  try {
    let text = config.text || (config.inputField ? inputData[config.inputField] : (inputData.text || inputData));
    if (text === null || text === undefined) text = '';
    if (typeof text !== 'string') {
      if (typeof text === 'object') {
        text = text.result || text.message || JSON.stringify(text);
      } else {
        text = String(text);
      }
    }
    
    let result = text;
    switch (config.action) {
      case 'uppercase': 
        result = text.toUpperCase(); 
        break;
      case 'lowercase': 
        result = text.toLowerCase(); 
        break;
      case 'trim': 
        result = text.trim(); 
        break;
      case 'split': 
        const separator = config.separator || ',';
        result = text.split(separator); 
        break;
      default: 
        throw new Error(`Unknown action: ${config.action}`);
    }
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`String manipulation failed: ${error.message}`);
  }
};
