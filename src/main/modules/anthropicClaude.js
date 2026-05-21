import { loadSettings } from '../storage.js'

export const execute = async (config, inputData) => {
  try {
    const settings = loadSettings();
    const apiKey = config.apiKey || settings.anthropicApiKey;
    const model = config.model || 'claude-3-haiku-20240307';
    const { prompt, systemPrompt } = config;
    
    if (!apiKey || !prompt) {
      throw new Error('Missing required Anthropic configuration (apiKey, prompt).');
    }
    
    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens || 1024
    };
    
    if (systemPrompt) {
      body.system = systemPrompt;
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const result = data.content && data.content[0] ? data.content[0].text : '';
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`Anthropic Claude failed: ${error.message}`);
  }
};
