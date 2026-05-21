import { loadSettings } from '../storage.js'

export const execute = async (config, inputData) => {
  try {
    const settings = loadSettings();
    const token = config.token || settings.githubToken;
    const { repo, title, body } = config;
    if (!token || !repo || !title) {
      throw new Error('Missing required GitHub configuration (token, repo, title).');
    }
    
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'FlowForge-App'
      },
      body: JSON.stringify({ title, body: body || '' })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    throw new Error(`GitHub Issue creation failed: ${error.message}`);
  }
};
