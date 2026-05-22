/**
 * AI Text Analyzer Module
 * Uses AI to analyze text for sentiment, summarization, or entity extraction.
 */
export default {
  meta: {
    type: 'aiTextAnalyzer',
    name: 'AI Text Analyzer',
    description: 'Analyze text using AI for sentiment, summaries, or entity extraction',
    category: 'ai',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const provider = (config.provider || 'openai').toLowerCase()
    const model = config.model || (provider === 'openai' ? 'gpt-4o-mini' : 'llama3')
    const analysisType = config.analysisType || 'sentiment'
    const text = config.text || inputData?.text || inputData?.data || ''

    if (!text) {
      throw new Error('AI Text Analyzer: text is required (via config.text or inputData.text)')
    }

    const textStr = typeof text === 'object' ? JSON.stringify(text) : String(text)
    const prompt = buildAnalysisPrompt(analysisType, textStr)

    let response
    if (provider === 'openai') {
      response = await callOpenAI(config, model, prompt)
    } else if (provider === 'ollama') {
      response = await callOllama(config, model, prompt)
    } else {
      throw new Error(`AI Text Analyzer: unsupported provider "${provider}"`)
    }

    // Parse the AI response
    let analysis
    try {
      analysis = JSON.parse(response)
    } catch {
      analysis = { raw: response }
    }

    return {
      analysisType,
      text: textStr.substring(0, 500),
      analysis,
      provider,
      model,
      timestamp: Date.now()
    }
  }
}

function buildAnalysisPrompt(type, text) {
  const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text

  switch (type) {
    case 'sentiment':
      return {
        system:
          'You are a sentiment analysis expert. Respond ONLY with valid JSON in this exact format: {"sentiment": "positive"|"negative"|"neutral"|"mixed", "confidence": 0.0-1.0, "explanation": "brief reason"}',
        user: `Analyze the sentiment of the following text:\n\n${truncatedText}`
      }

    case 'summary':
      return {
        system:
          'You are a text summarization expert. Respond ONLY with valid JSON in this exact format: {"summary": "concise summary", "keyPoints": ["point1", "point2"], "wordCount": number}',
        user: `Summarize the following text:\n\n${truncatedText}`
      }

    case 'entities':
      return {
        system:
          'You are a named entity recognition expert. Respond ONLY with valid JSON in this exact format: {"entities": [{"text": "entity", "type": "PERSON|ORGANIZATION|LOCATION|DATE|EVENT|OTHER", "context": "brief context"}]}',
        user: `Extract all named entities from the following text:\n\n${truncatedText}`
      }

    default:
      return {
        system: 'You are a text analysis expert. Respond with valid JSON.',
        user: `Analyze the following text (analysis type: ${type}):\n\n${truncatedText}`
      }
  }
}

async function callOpenAI(config, model, prompt) {
  const apiKey = config.apiKey
  if (!apiKey) {
    throw new Error('AI Text Analyzer (OpenAI): apiKey is required')
  }

  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      temperature: 0.3,
      max_tokens: 1024
    }),
    signal: AbortSignal.timeout(60000)
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`AI Text Analyzer (OpenAI): API error ${response.status} — ${errorBody}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '{}'
}

async function callOllama(config, model, prompt) {
  const baseUrl = config.baseUrl || 'http://127.0.0.1:11434'

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system: prompt.system,
      prompt: prompt.user,
      options: { temperature: 0.3 },
      stream: false
    }),
    signal: AbortSignal.timeout(300000)
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`AI Text Analyzer (Ollama): API error ${response.status} — ${errorBody}`)
  }

  const data = await response.json()
  return data.response || '{}'
}
