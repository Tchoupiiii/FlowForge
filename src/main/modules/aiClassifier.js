export const meta = {
  type: 'aiClassifier',
  label: 'Classificateur IA',
  category: 'ai'
}

export async function execute(config, inputData) {
  try {
    const provider = config.provider || 'openai'
    const apiKey = config.apiKey || ''
    const model = config.model || 'gpt-4'
    const text = inputData?.text || inputData?.data || JSON.stringify(inputData || '')
    const categoriesRaw = config.categories || 'positif\nnégatif\nneutre'
    const categories = categoriesRaw.split('\n').map(c => c.trim()).filter(Boolean)

    if (provider === 'openai' && !apiKey) {
      return { success: false, error: 'Clé API OpenAI requise', category: null, confidence: 0 }
    }

    if (categories.length < 2) {
      return { success: false, error: 'Au moins 2 catégories sont requises', category: null, confidence: 0 }
    }

    const systemPrompt = `Tu es un classificateur de texte. Tu dois classer le texte fourni dans EXACTEMENT une des catégories suivantes : ${categories.join(', ')}.

Réponds UNIQUEMENT en JSON avec ce format :
{"category": "la_catégorie_choisie", "confidence": 0.95, "reasoning": "explication courte"}

Ne réponds rien d'autre que le JSON.`

    const userPrompt = `Classe ce texte :\n\n"${text}"`

    let responseText = ''

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        return { success: false, error: `Erreur API: ${response.status} — ${err?.error?.message || ''}`, category: null, confidence: 0 }
      }

      const data = await response.json()
      responseText = data.choices?.[0]?.message?.content || ''
    } else if (provider === 'ollama') {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3',
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false
        })
      })

      if (!response.ok) {
        return { success: false, error: `Erreur Ollama: ${response.status}`, category: null, confidence: 0 }
      }

      const data = await response.json()
      responseText = data.response || ''
    }

    // Parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          success: true,
          category: parsed.category || categories[0],
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || '',
          availableCategories: categories,
          rawResponse: responseText
        }
      }
    } catch (parseErr) {
      // Fallback: try to find a category in the response
      const foundCategory = categories.find(c =>
        responseText.toLowerCase().includes(c.toLowerCase())
      )
      return {
        success: true,
        category: foundCategory || categories[0],
        confidence: 0.5,
        reasoning: responseText,
        availableCategories: categories,
        rawResponse: responseText
      }
    }

    return {
      success: true,
      category: categories[0],
      confidence: 0.5,
      reasoning: responseText,
      availableCategories: categories,
      rawResponse: responseText
    }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}`, category: null, confidence: 0 }
  }
}
