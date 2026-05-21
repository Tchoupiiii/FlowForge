export const execute = async (config, inputData) => {
  try {
    let { a, b, operation } = config;
    
    // Resolve dynamic values from inputData if applicable
    if (typeof a === 'string' && inputData[a] !== undefined) a = inputData[a];
    if (typeof b === 'string' && inputData[b] !== undefined) b = inputData[b];
    
    const numA = Number(a);
    const numB = Number(b);
    
    if (isNaN(numA) || isNaN(numB)) {
      throw new Error('Operands must be valid numbers.');
    }
    
    let result = 0;
    switch (operation) {
      case 'add': result = numA + numB; break;
      case 'subtract': result = numA - numB; break;
      case 'multiply': result = numA * numB; break;
      case 'divide':
        if (numB === 0) throw new Error('Division by zero.');
        result = numA / numB;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`Math operation failed: ${error.message}`);
  }
};
