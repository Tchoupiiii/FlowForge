export const execute = async (config, inputData) => {
  try {
    const text = config.text || (config.inputField ? inputData[config.inputField] : inputData);
    if (typeof text !== 'string') {
      throw new Error('Input must be a string.');
    }
    
    let result = '';
    if (config.action === 'encode') {
      result = Buffer.from(text, 'utf-8').toString('base64');
    } else if (config.action === 'decode') {
      result = Buffer.from(text, 'base64').toString('utf-8');
    } else {
      throw new Error("Action must be 'encode' or 'decode'.");
    }
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`Base64 operation failed: ${error.message}`);
  }
};
