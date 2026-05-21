import { loadSettings } from '../storage.js'

export const execute = async (config, inputData) => {
  try {
    const settings = loadSettings();
    const apiKey = config.apiKey || settings.trelloApiKey;
    const token = config.token || settings.trelloToken;
    const { idList, name, desc } = config;
    if (!apiKey || !token || !idList || !name) {
      throw new Error('Missing required Trello configuration (apiKey, token, idList, name).');
    }
    
    const url = new URL('https://api.trello.com/1/cards');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('token', token);
    url.searchParams.append('idList', idList);
    url.searchParams.append('name', name);
    if (desc) url.searchParams.append('desc', desc);
    
    const response = await fetch(url.toString(), { method: 'POST' });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trello API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    throw new Error(`Trello Card creation failed: ${error.message}`);
  }
};
