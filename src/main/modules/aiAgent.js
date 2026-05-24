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
    let systemPrompt = config.systemPrompt || 'You are a helpful assistant.'
    if (typeof systemPrompt === 'object') systemPrompt = JSON.stringify(systemPrompt, null, 2)
    else systemPrompt = String(systemPrompt)

    let userPrompt = config.userPrompt || ''
    if (typeof userPrompt === 'object') userPrompt = JSON.stringify(userPrompt, null, 2)
    else userPrompt = String(userPrompt)
    
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
  const content = choice?.message?.content || ''

  return {
    provider: 'openai',
    model: params.model,
    response: content,
    result: content,
    finishReason: choice?.finish_reason || 'unknown',
    usage: data.usage || {},
    timestamp: Date.now()
  }
}

async function callOllama(config, params) {
  const baseUrl = config.baseUrl || 'http://127.0.0.1:11434'

  try {
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
      signal: AbortSignal.timeout(45000) // Shortened to 45s
    })

    if (!response.ok) {
      const errorBody = await response.text()
      let msg = `API error ${response.status} — ${errorBody}`
      if (response.status === 500 || errorBody.toLowerCase().includes('limitations') || errorBody.toLowerCase().includes('failed to load') || errorBody.toLowerCase().includes('vram')) {
        msg += "\n\n💡 ASTUCE VRAM: Votre GPU GTX 1660 (6 Go de VRAM) ne dispose pas de suffisamment de mémoire pour charger ce modèle. Veuillez basculer vers un modèle plus léger comme 'qwen2.5:1.5b' ou 'llama3.2:3b' dans les paramètres de l'Agent."
      }
      throw new Error(msg)
    }

    const data = await response.json()
    const content = data.response || ''

    return {
      provider: 'ollama',
      model: params.model,
      response: content,
      result: content,
      done: data.done,
      totalDuration: data.total_duration,
      evalCount: data.eval_count,
      timestamp: Date.now()
    }
  } catch (error) {
    let errorMsg = error.message
    if (error.name === 'TimeoutError' || errorMsg.includes('timeout') || errorMsg.includes('aborted')) {
      errorMsg = `Délai d'attente dépassé (45s). Le modèle local est trop lent à répondre ou charge un modèle trop lourd pour votre GTX 1660 (6 Go de VRAM). Essayez un modèle plus léger comme 'qwen2.5:1.5b'.`
    } else if (errorMsg.includes('fetch') || errorMsg.includes('refused')) {
      errorMsg = `Connexion refusée. Assurez-vous qu'Ollama est démarré localement sur ${baseUrl}.`
    }
    throw new Error(`AI Agent (Ollama): ${errorMsg}`)
  }
}

