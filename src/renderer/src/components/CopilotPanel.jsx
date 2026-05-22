import React, { useState, useEffect } from 'react'
import { X, Sparkles, Send, Bot, AlertCircle } from 'lucide-react'
import { MODULE_DEFINITIONS } from '../data/moduleDefinitions'
import { useWorkflow } from '../context/WorkflowContext'

export default function CopilotPanel({ onClose }) {
  const { loadDemoWorkflow } = useWorkflow()
  const [provider, setProvider] = useState('ollama')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [ollamaModels, setOllamaModels] = useState([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (provider === 'ollama') {
      if (window.electronAPI && window.electronAPI.getOllamaModels) {
        window.electronAPI.getOllamaModels().then(data => {
          if (data.success) {
            const models = data.models?.map(m => m.name) || []
            setOllamaModels(models)
            if (models.length > 0 && !model) {
              setModel(models[0])
            }
          }
        }).catch(err => {
          console.error('Ollama list error', err)
          setError("Impossible de contacter Ollama.")
        })
      }
    } else {
      setModel('gpt-4o')
    }
  }, [provider])

  const handleGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    setError('')
    setMessage('')

    const systemPrompt = `Tu es FlowForge Copilot. Ton rôle est de générer des workflows automatisés (no-code).
Un workflow est un objet JSON de cette forme :
{
  "name": "Nom du workflow",
  "description": "Description",
  "nodes": [
    {
      "id": "n1",
      "type": "customNode",
      "position": { "x": 100, "y": 150 },
      "data": { "type": "TYPE_DU_MODULE", "config": { ... } }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "n1", "target": "n2", "type": "smoothstep", "animated": true }
  ]
}

Voici la liste des modules disponibles (TYPE_DU_MODULE) :
${MODULE_DEFINITIONS.map(m => `- ${m.type} : ${m.label} (${m.help.description})`).join('\n')}

INSTRUCTIONS :
1. Analyse la demande de l'utilisateur.
2. Si un module essentiel manque pour réaliser ce qu'il demande, retourne STRICTEMENT le JSON : { "impossible": true }
3. Sinon, crée un workflow complet et retourne STRICTEMENT et UNIQUEMENT le JSON du workflow (pas de texte avant ou après, pas de balises Markdown).
Positionne les noeuds avec un x croissant (ex: 100, 350, 600).`

    try {
      let responseText = ''

      if (provider === 'ollama') {
        if (window.electronAPI && window.electronAPI.generateOllama) {
          const options = { system: systemPrompt, format: 'json' }
          const res = await window.electronAPI.generateOllama(prompt, model, options)
          if (!res.success) throw new Error(res.error)
          responseText = res.response
        } else {
          throw new Error('API locale non disponible')
        }
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            response_format: { type: "json_object" },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ]
          })
        })
        if (!res.ok) throw new Error('Erreur API OpenAI (Vérifiez la clé API)')
        const data = await res.json()
        responseText = data.choices[0].message.content
      }

      const workflow = JSON.parse(responseText)

      if (workflow.impossible) {
        setMessage("C'est impossible pour l'instant, aucun module ne permet de faire ça. Veuillez me contacter !")
      } else {
        // Hydrate node data with required defaults
        workflow.nodes = workflow.nodes.map(n => {
          const modDef = MODULE_DEFINITIONS.find(m => m.type === n.data.type)
          if (modDef) {
            n.data = {
              ...n.data,
              label: modDef.label,
              icon: modDef.icon,
              color: modDef.color,
              category: modDef.category,
              inputs: modDef.inputs,
              outputs: modDef.outputs,
              status: 'idle'
            }
          }
          return n
        })

        loadDemoWorkflow(workflow)
        setMessage("Workflow généré avec succès !")
      }

    } catch (e) {
      setError(`Erreur lors de la génération: ${e.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="copilot-panel slide-in-right">
      <div className="copilot-header">
        <div className="copilot-title">
          <Sparkles size={24} color="#818cf8" />
          <h2>FlowForge Copilot</h2>
        </div>
        <button className="help-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="copilot-body">
        <p className="copilot-intro">Décrivez le workflow de vos rêves, et l'IA s'occupe de le créer pour vous sur le Canvas.</p>
        
        <div className="copilot-config">
          <label className="config-field-label">Fournisseur d'IA</label>
          <select className="config-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="ollama">Local (Ollama)</option>
            <option value="openai">OpenAI (Cloud)</option>
          </select>

          {provider === 'openai' && (
            <>
              <label className="config-field-label">Clé API OpenAI</label>
              <input type="password" className="config-input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." />
            </>
          )}

          {provider === 'ollama' && (
            <>
              <label className="config-field-label">Modèle local</label>
              <select className="config-select" value={model} onChange={e => setModel(e.target.value)}>
                {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </>
          )}
        </div>

        <div className="copilot-chat">
          <label className="config-field-label">Que souhaitez-vous automatiser ?</label>
          <textarea 
            className="config-textarea" 
            rows={4} 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: Un workflow qui télécharge un flux RSS, filtre les articles sur l'IA, et m'envoie un résumé sur Slack..."
          />
          
          <button 
            className="toolbar-btn toolbar-btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
            onClick={handleGenerate}
            disabled={loading || !prompt || (provider === 'openai' && !apiKey)}
          >
            {loading ? <span className="toolbar-status-dot running" /> : <Send size={16} />}
            <span>{loading ? 'Génération en cours...' : 'Générer le Workflow'}</span>
          </button>
        </div>

        {error && (
          <div className="copilot-message error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className={`copilot-message ${message.includes('impossible') ? 'warning' : 'success'}`}>
            <Bot size={16} />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
