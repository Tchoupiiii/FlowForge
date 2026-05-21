import { loadSettings } from '../storage.js'

export const execute = async (config, inputData) => {
  try {
    const settings = loadSettings();
    const apiKey = config.apiKey || settings.openaiApiKey;
    const model = config.model || 'gpt-3.5-turbo';
    const { prompt, systemPrompt } = config;
    
    if (!apiKey || !prompt) {
      throw new Error('Missing required OpenAI configuration (apiKey, prompt).');
    }
    
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';
    
    return { success: true, result };
  } catch (error) {
    throw new Error(`OpenAI Chat failed: ${error.message}`);
  }
};
