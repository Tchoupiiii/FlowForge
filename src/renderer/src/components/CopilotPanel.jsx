import React, { useState, useEffect } from 'react'
import { X, Sparkles, Send, Bot, AlertCircle, Settings, Plus, MessageSquare } from 'lucide-react'
import { MODULE_DEFINITIONS } from '../data/moduleDefinitions'
import { useWorkflow } from '../context/WorkflowContext'

export default function CopilotPanel({ onClose }) {
  const { loadDemoWorkflow, nodes, edges } = useWorkflow()
  const [width, setWidth] = useState(380)
  const [mode, setMode] = useState(() => localStorage.getItem('copilot_mode') || 'create')
  const [provider, setProvider] = useState(() => localStorage.getItem('copilot_provider') || 'ollama')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('copilot_apiKey') || '')
  const [model, setModel] = useState(() => localStorage.getItem('copilot_model') || '')
  const [ollamaModels, setOllamaModels] = useState([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent) => {
      // For right panel, moving mouse left increases width
      const newWidth = startWidth - (moveEvent.clientX - startX);
      setWidth(Math.max(300, Math.min(newWidth, window.innerWidth / 2)));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const [message, setMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [discussions, setDiscussions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('copilot_discussions'))
      return stored && stored.length > 0 ? stored : [{ id: Date.now().toString(), title: 'Nouvelle discussion', history: [] }]
    } catch {
      return [{ id: Date.now().toString(), title: 'Nouvelle discussion', history: [] }]
    }
  })
  const [activeId, setActiveId] = useState(() => localStorage.getItem('copilot_active_id') || discussions[0]?.id)
  const activeDiscussion = discussions.find(d => d.id === activeId) || discussions[0]
  const chatHistory = activeDiscussion.history || []

  useEffect(() => {
    localStorage.setItem('copilot_mode', mode)
    localStorage.setItem('copilot_provider', provider)
    localStorage.setItem('copilot_apiKey', apiKey)
    localStorage.setItem('copilot_model', model)
    localStorage.setItem('copilot_discussions', JSON.stringify(discussions))
    localStorage.setItem('copilot_active_id', activeId)
  }, [mode, provider, apiKey, model, discussions, activeId])

  useEffect(() => {
    if (provider === 'ollama') {
      if (window.electronAPI && window.electronAPI.getOllamaModels) {
        window.electronAPI.getOllamaModels().then(data => {
          if (data.success) {
            const models = data.models?.map(m => m.name) || []
            setOllamaModels(models)
            if (models.length > 0 && (!model || !models.includes(model))) {
              setModel(models[0])
            }
          }
        }).catch(err => {
          console.error('Ollama list error', err)
          setError("Impossible de contacter Ollama.")
        })
      }
    } else if (provider === 'openai') {
      if (!model || !model.startsWith('gpt') && !model.startsWith('o1')) setModel('gpt-4o')
    } else if (provider === 'anthropic') {
      if (!model || !model.startsWith('claude')) setModel('claude-3-5-sonnet-20241022')
    }
  }, [provider])

  const handleGenerate = async () => {
    if (!prompt) return
    
    const userMessage = { role: 'user', content: prompt }
    setDiscussions(prev => prev.map(d => {
      if (d.id === activeId) {
        let newTitle = d.title;
        if (newTitle === 'Nouvelle discussion' && prompt.length > 0) {
          newTitle = prompt.substring(0, 20) + (prompt.length > 20 ? '...' : '');
        }
        return { ...d, title: newTitle, history: [...d.history, userMessage] }
      }
      return d
    }))
    setPrompt('')
    setLoading(true)
    setError('')
    setMessage('')

    const currentWorkflowJson = JSON.stringify({ nodes, edges })
    const basePrompt = `Tu es FlowForge Copilot. Ton rôle est d'aider l'utilisateur avec son workflow.
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
    { "id": "e1-2", "source": "n1", "target": "n2", "sourceHandle": "a", "targetHandle": "a", "type": "smoothstep", "animated": true }
  ]
}

Voici la liste des modules disponibles (TYPE_DU_MODULE) :
${MODULE_DEFINITIONS.map(m => `- ${m.type} : ${m.label} (${m.help.description}). Pour "sourceHandle" et "targetHandle" utilise "a" (générique) ou une clé spécifique. Entrées spécifiques: ${m.configFields?.map(f => f.key).join(', ') || 'aucune'}. Sorties spécifiques: ${m.type === 'condition' ? 'true, false' : (m.outputFields?.map(f => f.key).join(', ') || 'aucune')}`).join('\n')}

INSTRUCTIONS :
1. Si l'utilisateur te pose une question générale, réponds lui en texte clair et naturel (sans JSON).
2. Si l'utilisateur te demande explicitement de générer, ajouter ou modifier le workflow, retourne STRICTEMENT un objet JSON représentant le workflow (SANS texte autour).
3. Si un module essentiel manque pour réaliser ce qu'il demande, retourne STRICTEMENT le JSON : { "impossible": true }
4. Si l'utilisateur demande de récupérer des informations, des actualités ou des infos macro-économiques, UTILISE LE MODULE "rssParser" avec une URL pertinente (ex: https://news.google.com/rss/search?q=macro+economy+usd) ou "httpRequest" au lieu de dire que c'est impossible.
`

    const systemPrompt = `${basePrompt}\n\n[CONTEXTE] Voici le workflow actuellement sur le Canvas (s'il est vide, tu peux l'ignorer) :\n${currentWorkflowJson}\n\nSi l'utilisateur demande une modification, applique-la sur ce workflow. S'il demande une création, crée un nouveau workflow de zéro.`

    // Prepare messages array for API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-5), // keep last 5 messages for context
      userMessage
    ]

    try {
      let responseText = ''

      if (provider === 'ollama') {
        if (window.electronAPI && window.electronAPI.generateOllama) {
          // Send messages array as prompt by joining them for Ollama, or use Ollama chat endpoint if supported. 
          // For simplicity, we just pass the system prompt and the user's latest prompt.
          const ollamaPrompt = `Historique: ${chatHistory.slice(-3).map(m => m.role + ': ' + m.content).join('\n')}\n\nUtilisateur: ${userMessage.content}`
          const options = { system: systemPrompt, num_predict: 2048 }
          const res = await window.electronAPI.generateOllama(ollamaPrompt, model, options)
          if (!res.success) throw new Error(res.error)
          responseText = res.response
        } else {
          throw new Error('API locale non disponible')
        }
      } else if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage.content }]
          })
        })
        if (!res.ok) throw new Error('Erreur API Anthropic (Vérifiez la clé API)')
        const data = await res.json()
        responseText = data.content[0].text
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: messages
          })
        })
        if (!res.ok) throw new Error('Erreur API OpenAI (Vérifiez la clé API)')
        const data = await res.json()
        responseText = data.choices[0].message.content
      }

      setDiscussions(prev => prev.map(d => d.id === activeId ? { ...d, history: [...d.history, { role: 'assistant', content: responseText }] } : d))

      let workflow
      try {
        workflow = JSON.parse(responseText)
      } catch (err) {
        // Fallback for partial/markdown JSON from local models
        const match = responseText.match(/\{[\s\S]*"nodes"[\s\S]*\}/)
        if (match) {
          try { workflow = JSON.parse(match[0]) } catch(e) {}
        } else if (responseText.includes('"impossible": true')) {
          workflow = { impossible: true }
        }
      }

      if (workflow && workflow.impossible) {
        setMessage("C'est impossible pour l'instant, aucun module ne permet de faire ça.")
      } else if (workflow && workflow.nodes) {
        // Hydrate node data with required defaults
        workflow.nodes = workflow.nodes.map(n => {
          const rawType = n.data?.type || n.type
          const modDef = MODULE_DEFINITIONS.find(m => m.type === rawType)
          
          // Force type to customNode so React Flow renders it correctly
          n.type = 'customNode'
          
          if (modDef) {
            n.data = {
              ...n.data,
              type: modDef.type, // ensure correct data.type
              label: modDef.label,
              icon: modDef.icon,
              color: modDef.color,
              category: modDef.category,
              inputs: modDef.inputs,
              outputs: modDef.outputs,
              status: 'idle'
            }
          } else if (!n.data) {
            n.data = { type: rawType, label: 'Inconnu' }
          }
          return n
        })

        // Ensure edges have handles
        if (workflow.edges) {
          workflow.edges = workflow.edges.map(e => ({
            sourceHandle: 'a',
            targetHandle: 'a',
            ...e
          }))
        }

        loadDemoWorkflow(workflow)
        setMessage("Workflow appliqué avec succès !")
      }

    } catch (e) {
      setError(`Erreur: ${e.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="copilot-panel slide-in-right" style={{ width: `${width}px`, position: 'relative' }}>
      {/* Resize Handle (Left side) */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: -2,
          top: 0,
          bottom: 0,
          width: '5px',
          cursor: 'col-resize',
          zIndex: 100,
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      />
      
      <div className="copilot-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="copilot-title">
            <Sparkles size={24} color="#818cf8" />
            <h2>FlowForge Copilot</h2>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="toolbar-btn" onClick={() => setShowSettings(!showSettings)} title="Paramètres IA" style={{ padding: '6px 10px', background: showSettings ? 'var(--bg-surface-2)' : 'transparent', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <Settings size={16} color={showSettings ? 'var(--accent)' : 'var(--text)'} />
              <span style={{ color: 'var(--text)', fontWeight: '500' }}>Paramètres IA</span>
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', overflowX: 'auto', gap: '4px', flex: 1, paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {discussions.map(d => (
              <div 
                key={d.id} 
                onClick={() => setActiveId(d.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 8px', borderRadius: '4px', 
                  background: activeId === d.id ? 'var(--bg-surface-2)' : 'transparent',
                  cursor: 'pointer', border: activeId === d.id ? '1px solid var(--border)' : '1px solid transparent',
                  fontSize: '11px', whiteSpace: 'nowrap'
                }}>
                <span title={d.title} style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</span>
                {discussions.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newDiscussions = discussions.filter(x => x.id !== d.id);
                      setDiscussions(newDiscussions);
                      if (activeId === d.id) setActiveId(newDiscussions[0].id);
                    }}
                    style={{ padding: '2px', opacity: 0.6 }}
                  ><X size={12} /></button>
                )}
              </div>
            ))}
          </div>

          <button 
            className="toolbar-btn" 
            style={{ padding: '4px', background: 'var(--bg-surface-2)' }}
            onClick={() => {
              const newId = Date.now().toString()
              setDiscussions(prev => [...prev, { id: newId, title: 'Nouvelle discussion', history: [] }])
              setActiveId(newId)
            }}
            title="Nouvelle discussion"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="copilot-body">
        <p className="copilot-intro">Décrivez le workflow de vos rêves, et l'IA s'occupe de le créer pour vous sur le Canvas.</p>
        
        {showSettings && (<div className="copilot-config">
          <label className="config-field-label">Action</label>
          <select className="config-select" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="create">Créer un nouveau workflow</option>
            <option value="modify">Modifier le workflow actuel</option>
          </select>

          <label className="config-field-label">Fournisseur d'IA</label>
          <select className="config-select" value={provider} onChange={(e) => { setProvider(e.target.value); if(e.target.value==='openai') setModel('gpt-4o'); else if(e.target.value==='anthropic') setModel('claude-3-5-sonnet-20241022') }}>
            <option value="ollama">Local (Ollama)</option>
            <option value="openai">OpenAI (Cloud)</option>
            <option value="anthropic">Anthropic (Cloud)</option>
          </select>

          {provider === 'openai' && (
            <>
              <label className="config-field-label">Clé API OpenAI</label>
              <input type="password" className="config-input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." />
              <label className="config-field-label">Modèle OpenAI</label>
              <select className="config-select" value={model} onChange={e => setModel(e.target.value)}>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="o1-mini">o1 Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </>
          )}

          {provider === 'anthropic' && (
            <>
              <label className="config-field-label">Clé API Anthropic</label>
              <input type="password" className="config-input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." />
              <label className="config-field-label">Modèle Anthropic</label>
              <select className="config-select" value={model} onChange={e => setModel(e.target.value)}>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
              </select>
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
        </div>)}

        <div className="copilot-chat">
          {chatHistory.length > 0 && (
            <div className="chat-history" style={{ 
              maxHeight: '250px', 
              overflowY: 'auto', 
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'rgba(124, 107, 240, 0.1)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--glass-border)' : 'var(--accent)'}`,
                  color: msg.role === 'user' ? 'var(--text)' : 'var(--text)',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%'
                }}>
                  <strong style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {msg.role === 'user' ? 'Vous' : 'Copilot'}
                  </strong>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                </div>
              ))}
            </div>
          )}

          <label className="config-field-label">Discutez avec l'IA ou demandez un workflow</label>
          <textarea 
            className="config-textarea" 
            rows={3} 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: A quoi sert ce workflow ? ou Crée un workflow qui télécharge un flux RSS..."
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
