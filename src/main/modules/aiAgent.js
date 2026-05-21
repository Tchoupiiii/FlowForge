import { loadSettings } from '../storage.js'

export default {
  meta: {
    type: 'aiAgent',
    name: 'AI Agent',
    description: 'Send prompts to OpenAI or Ollama and receive AI-generated responses',
    category: 'ai',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const provider = (config.provider || 'openai').toLowerCase()
    const model = config.model || (provider === 'openai' ? 'gpt-4o-mini' : 'llama3')
    const systemPrompt = interpolate(config.systemPrompt || 'You are a helpful assistant.', inputData)
    const userPrompt = interpolate(config.userPrompt || '', inputData)
    const temperature = config.temperature !== undefined ? Number(config.temperature) : 0.7
    const maxTokens = config.maxTokens || 2048

    if (!userPrompt) {
      throw new Error('AI Agent: userPrompt is required')
    }

    if (provider === 'openai') {
      return await callOpenAI(config, { model, systemPrompt, userPrompt, temperature, maxTokens })
    } else if (provider === 'ollama') {
      return await callOllama(config, { model, systemPrompt, userPrompt, temperature })
    } else {
      throw new Error(`AI Agent: unsupported provider "${provider}". Use "openai" or "ollama".`)
    }
  }
}

async function callOpenAI(config, params) {
  const settings = loadSettings();
  const apiKey = config.apiKey || settings.openaiApiKey;
  
  if (!apiKey) {
    throw new Error('AI Agent (OpenAI): apiKey is required (configure it in Settings or the Node)')
  }

  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt }
      ],
      temperature: params.temperature,
      max_tokens: params.maxTokens
    }),
    signal: AbortSignal.timeout(120000)
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`AI Agent (OpenAI): API error ${response.status} — ${errorBody}`)
  }

  const data = await response.json()
  const choice = data.choices?.[0]

  return {
    provider: 'openai',
    model: params.model,
    response: choice?.message?.content || '',
    finishReason: choice?.finish_reason || 'unknown',
    usage: data.usage || {},
    timestamp: Date.now()
  }
}

async function callOllama(config, params) {
  const baseUrl = config.baseUrl || 'http://localhost:11434'

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: params.model,
      system: params.systemPrompt,
      prompt: params.userPrompt,
      options: {
        temperature: params.temperature
      },
      stream: false
    }),
    signal: AbortSignal.timeout(300000) // Ollama can be slow
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`AI Agent (Ollama): API error ${response.status} — ${errorBody}`)
  }

  const data = await response.json()

  return {
    provider: 'ollama',
    model: params.model,
    response: data.response || '',
    done: data.done,
    totalDuration: data.total_duration,
    evalCount: data.eval_count,
    timestamp: Date.now()
  }
}

function interpolate(template, data) {
  if (!data || typeof template !== 'string') return template

  return template.replace(/\{\{(.+?)\}\}/g, (_match, key) => {
    const trimmedKey = key.trim()
    const parts = trimmedKey.split('.')
    let value = data

    for (const part of parts) {
      if (value === null || value === undefined) return ''
      value = value[part]
    }

    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}
