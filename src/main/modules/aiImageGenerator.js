export const meta = {
  type: 'aiImageGenerator',
  label: 'Générateur Image IA',
  category: 'ai'
}

export async function execute(config, inputData) {
  try {
    const apiKey = config.apiKey || ''
    const prompt = config.prompt || inputData?.prompt || inputData?.text || ''
    const size = config.size || '512x512'

    if (!apiKey) {
      return {
        success: false,
        error: 'Clé API OpenAI requise',
        imageUrl: null
      }
    }

    if (!prompt) {
      return {
        success: false,
        error: 'Un prompt de description est requis',
        imageUrl: null
      }
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `Erreur API: ${response.status} — ${errorData?.error?.message || response.statusText}`,
        imageUrl: null
      }
    }

    const data = await response.json()
    const imageUrl = data?.data?.[0]?.url || null
    const revisedPrompt = data?.data?.[0]?.revised_prompt || prompt

    return {
      success: true,
      imageUrl,
      revisedPrompt,
      prompt,
      size,
      model: 'dall-e-3'
    }
  } catch (error) {
    return {
      success: false,
      error: `Erreur: ${error.message}`,
      imageUrl: null
    }
  }
}
