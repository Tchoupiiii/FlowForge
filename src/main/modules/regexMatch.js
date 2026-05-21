export const execute = async (config, inputData) => {
  try {
    const text = config.inputField ? inputData[config.inputField] : inputData;
    
    if (typeof text !== 'string') {
      throw new Error(`Input is not a string (inputField: ${config.inputField})`);
    }
    if (!config.pattern) {
      throw new Error('Missing required configuration: pattern');
    }
    
    const flags = config.flags || 'g';
    const regex = new RegExp(config.pattern, flags);
    const matches = [...text.matchAll(regex)].map(match => match[0]);
    
    return { success: true, result: matches };
  } catch (error) {
    throw new Error(`Regex match failed: ${error.message}`);
  }
};
