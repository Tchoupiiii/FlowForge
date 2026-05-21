export const execute = async (config, inputData) => {
  try {
    const csv = config.csv || (config.inputField ? inputData[config.inputField] : inputData);
    if (typeof csv !== 'string') {
      throw new Error('Input must be a CSV string.');
    }
    
    const rows = csv.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    if (rows.length === 0) return { success: true, result: [] };
    
    const parseRow = (row) => {
      const result = [];
      let insideQuotes = false;
      let current = '';
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"' && row[i+1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };

    const headers = parseRow(rows[0]);
    const result = [];
    
    for (let i = 1; i < rows.length; i++) {
      const values = parseRow(rows[i]);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      result.push(obj);
    }
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`CSV to JSON conversion failed: ${error.message}`);
  }
};
