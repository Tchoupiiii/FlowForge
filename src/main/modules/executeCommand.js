import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const execute = async (config, inputData) => {
  try {
    if (!config.command) {
      throw new Error('Missing required configuration: command');
    }
    
    // allow templating using inputData if necessary, but here we just run config.command
    const { stdout, stderr } = await execAsync(config.command);
    return { success: true, result: { stdout, stderr } };
  } catch (error) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
};
