export const execute = async (config, inputData) => {
  try {
    let data = config.inputField ? inputData[config.inputField] : inputData;
    
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        data = [data];
      } else {
        throw new Error('Input must be an array of objects to convert to CSV.');
      }
    }
    
    if (data.length === 0) {
      return { success: true, result: '' };
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return { success: true, result: csvRows.join('\n') };
  } catch (error) {
    throw new Error(`JSON to CSV conversion failed: ${error.message}`);
  }
};
