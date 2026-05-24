import React, { useState, useCallback, useEffect, useRef } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { Phone, PhoneOff, Mic, MicOff, Send } from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext'
import { ExecutionProvider } from './context/ExecutionContext'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import ConfigPanel from './components/ConfigPanel'
import HelpPanel from './components/HelpPanel'
import Toolbar from './components/Toolbar'
import ExecutionLog from './components/ExecutionLog'
import DemoGallery from './components/DemoGallery'
import ContextMenu from './components/ContextMenu'
import TabBar from './components/TabBar'
import GuideModal from './components/GuideModal'
import CopilotPanel from './components/CopilotPanel'
import SettingsModal from './components/SettingsModal'
import WorkflowsModal from './components/WorkflowsModal'
import NotificationsModal from './components/NotificationsModal'
import { ToastProvider, useToast } from './components/ToastProvider'

function AppContent() {
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [helpModule, setHelpModule] = useState(null)
  const [showDemoGallery, setShowDemoGallery] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWorkflows, setShowWorkflows] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsHistory, setNotificationsHistory] = useState([])
  const [showExecutionLog, setShowExecutionLog] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [updateReady, setUpdateReady] = useState(false)
  const [appVersion, setAppVersion] = useState('v1.0.0')
  const toast = useToast()
  const { addNode, nodes, setNodes, setEdges, activeTabId, updateNodeConfig } = useWorkflow()

  // --- TELEPHONE CALL SIMULATOR STATES ---
  const [activeCall, setActiveCall] = useState(null) // null or { nodeId, label, config }
  const [callHistory, setCallHistory] = useState([]) // array of { role, text }
  const [callStatus, setCallStatus] = useState('idle') // 'idle' | 'active' | 'hangup'
  const [callDuration, setCallDuration] = useState(0)
  const [callInputText, setCallInputText] = useState('')
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [actionConsequence, setActionConsequence] = useState('Aucune action')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false)
  const [speechRecognitionActive, setSpeechRecognitionActive] = useState(false)

  const recognitionRef = useRef(null)
  const transcriptEndRef = useRef(null)
  const callDurationIntervalRef = useRef(null)

  // Listen to open call simulator event
  useEffect(() => {
    const handleOpenCall = (e) => {
      const { nodeId, label, config } = e.detail
      setActiveCall({ nodeId, label, config })
      setCallStatus('active')
      setCallDuration(0)
      setCallInputText('')
      setIsAiResponding(false)
      setActionConsequence('Aucune action')
      setIsVoiceMode(false)
      
      const initialGreeting = `Allô ? Bonjour, je suis votre assistant vocal téléphonique. Comment puis-je vous aider aujourd'hui ?`
      setCallHistory([
        { role: 'agent', text: initialGreeting }
      ])
    }
    window.addEventListener('open-call-simulator', handleOpenCall)
    return () => window.removeEventListener('open-call-simulator', handleOpenCall)
  }, [])

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'active') {
      callDurationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current)
      }
    }
    return () => {
      if (callDurationIntervalRef.current) clearInterval(callDurationIntervalRef.current)
    }
  }, [callStatus])

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [callHistory])

  // Send message to Phone Agent backend executor
  const handleSendCallMessage = useCallback(async (userText) => {
    if (!userText.trim() || !activeCall) return
    
    const userTurn = { role: 'caller', text: userText }
    setCallHistory(prev => [...prev, userTurn])
    setCallInputText('')
    setIsAiResponding(true)
    
    if (recognitionRef.current && speechRecognitionActive) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    try {
      const updatedHistory = [...callHistory, userTurn]
      const response = await window.electronAPI.executeModule('phoneAgent', activeCall.config, {
        text: userText,
        chatHistory: updatedHistory
      })
      
      if (response && response.success) {
        const agentTurn = { role: 'agent', text: response.response }
        setCallHistory(prev => [...prev, agentTurn])
        if (response.result) {
          setActionConsequence(response.result)
        }
        
        if (isVoiceMode && window.speechSynthesis) {
          setSpeechSynthesisActive(true)
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(response.response)
          utterance.lang = 'fr-FR'
          
          const voices = window.speechSynthesis.getVoices()
          const configuredVoice = activeCall.config?.voice
          const matchedVoice = voices.find(v => v.name.toLowerCase().includes(configuredVoice?.toLowerCase() || '')) || voices.find(v => v.lang.startsWith('fr'))
          if (matchedVoice) utterance.voice = matchedVoice
          
          utterance.onend = () => {
            setSpeechSynthesisActive(false)
            if (isVoiceMode && recognitionRef.current && callStatus === 'active') {
              try {
                recognitionRef.current.start()
              } catch (err) {}
            }
          }
          utterance.onerror = () => {
            setSpeechSynthesisActive(false)
            if (isVoiceMode && recognitionRef.current && callStatus === 'active') {
              try {
                recognitionRef.current.start()
              } catch (err) {}
            }
          }
          window.speechSynthesis.speak(utterance)
        }
      } else {
        setCallHistory(prev => [...prev, { role: 'agent', text: `[Erreur: ${response?.error || 'Échec de connexion'}]` }])
      }
    } catch (error) {
      setCallHistory(prev => [...prev, { role: 'agent', text: `[Erreur de communication: ${error.message}]` }])
    } finally {
      setIsAiResponding(false)
    }
  }, [activeCall, callHistory, isVoiceMode, speechRecognitionActive, callStatus])

  // Speech Recognition hook
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    
    if (isVoiceMode && callStatus === 'active') {
      const rec = new SpeechRecognition()
      rec.lang = 'fr-FR'
      rec.continuous = false
      rec.interimResults = false
      
      rec.onstart = () => {
        setSpeechRecognitionActive(true)
      }
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          handleSendCallMessage(transcript)
        }
      }
      rec.onend = () => {
        setSpeechRecognitionActive(false)
        if (isVoiceMode && !isAiResponding && !speechSynthesisActive && callStatus === 'active') {
          try {
            rec.start()
          } catch (e) {}
        }
      }
      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e)
        setSpeechRecognitionActive(false)
      }
      
      recognitionRef.current = rec
      
      if (callHistory.length === 1 && callHistory[0].role === 'agent') {
        setSpeechSynthesisActive(true)
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(callHistory[0].text)
        utterance.lang = 'fr-FR'
        const voices = window.speechSynthesis.getVoices()
        const configuredVoice = activeCall?.config?.voice
        const matchedVoice = voices.find(v => v.name.toLowerCase().includes(configuredVoice?.toLowerCase() || '')) || voices.find(v => v.lang.startsWith('fr'))
        if (matchedVoice) utterance.voice = matchedVoice
        
        utterance.onend = () => {
          setSpeechSynthesisActive(false)
          try {
            rec.start()
          } catch (err) {}
        }
        utterance.onerror = () => {
          setSpeechSynthesisActive(false)
          try {
            rec.start()
          } catch (err) {}
        }
        window.speechSynthesis.speak(utterance)
      } else {
        try {
          rec.start()
        } catch (e) {}
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setSpeechRecognitionActive(false)
      setSpeechSynthesisActive(false)
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [isVoiceMode, callStatus])

  // Hangup (Raccrocher) call
  const handleHangUp = useCallback(async () => {
    if (!activeCall) return
    
    setCallStatus('hangup')
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSpeechRecognitionActive(false)
    setSpeechSynthesisActive(false)
    
    const fullTranscript = callHistory.map(turn => {
      const speaker = turn.role === 'agent' ? '🤖 AGENT IA' : '🎙️ APPELANT'
      return `[${speaker}]: ${turn.text}`
    }).join('\n')
    
    try {
      await window.electronAPI.executeModule('phoneAgent', activeCall.config, {
        hangup: true,
        transcript: fullTranscript
      })
    } catch (e) {
      console.error("Erreur lors du hangup:", e)
    }

    if (updateNodeConfig) {
      updateNodeConfig(activeCall.nodeId, {
        lastTranscript: fullTranscript,
        lastResult: actionConsequence
      })
    }
    
    toast.success('Appel Terminé', `L'appel est terminé. Résultat: ${actionConsequence}`)
    
    setTimeout(() => {
      setActiveCall(null)
      setCallStatus('idle')
    }, 1500)
  }, [activeCall, callHistory, actionConsequence, updateNodeConfig])

  useEffect(() => {
    if (window.electronAPI) {
      if (window.electronAPI.onUpdateDownloaded) {
        window.electronAPI.onUpdateDownloaded(() => {
          setUpdateReady(true)
          toast.success('Mise à jour prête', 'FlowForge sera mis à jour au prochain démarrage.')
        })
      }
      if (window.electronAPI.onUpdateAvailable) {
        window.electronAPI.onUpdateAvailable(() => {
          toast.info('Mise à jour disponible', 'Téléchargement en cours...')
        })
      }
      if (window.electronAPI.onAppNotification) {
        window.electronAPI.onAppNotification((data) => {
          const type = data.type || 'info'
          if (toast[type]) {
            toast[type](data.title || 'Notification', data.body || '')
          }
        })
      }
      if (window.electronAPI.onAppNotificationHistory) {
        window.electronAPI.onAppNotificationHistory((data) => {
          setNotificationsHistory(prev => [data, ...prev])
        })
      }
      if (window.electronAPI.getVersion) {
        window.electronAPI.getVersion().then(version => {
          setAppVersion('v' + version)
        })
      }
    }
  }, [])
  // Reset selected node when switching tabs
  useEffect(() => {
    setSelectedNodeId(null)
  }, [activeTabId])

  const handleNodeSelect = useCallback((node) => {
    setSelectedNodeId(node ? node.id : null)
  }, [])

  const handleShowHelp = useCallback((moduleDef) => {
    setHelpModule(moduleDef)
  }, [])

  const handleCloseHelp = useCallback(() => {
    setHelpModule(null)
  }, [])

  const handleShowDemos = useCallback(() => {
    setShowDemoGallery(true)
    setSelectedNodeId(null)
  }, [])

  const handleCloseDemos = useCallback(() => {
    setShowDemoGallery(false)
  }, [])

  const handleShowGuide = useCallback(() => {
    setShowGuide(true)
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setShowCopilot(prev => !prev)
  }, [])

  const handleToggleLog = useCallback(() => {
    setShowExecutionLog(prev => !prev)
  }, [])

  const handleCloseConfig = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const handleContextMenu = useCallback((data) => {
    setContextMenu(data)
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId))
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }, [setNodes, setEdges, selectedNodeId])

  const handleDuplicateNode = useCallback((nodeId) => {
    const original = nodes.find(n => n.id === nodeId)
    if (!original) return

    addNode(original.data.type, {
      x: original.position.x + 40,
      y: original.position.y + 40
    })
  }, [nodes, addNode])

  const handleAddNodeFromMenu = useCallback((type, position) => {
    addNode(type, position)
  }, [addNode])

  return (
    <div className="app-layout">
      <TitleBar />
      <div className="app-body">
        <Sidebar />
        <div className="main-area">
            <TabBar />
            <Toolbar
              onShowDemos={handleShowDemos}
              onShowGuide={handleShowGuide}
              onShowSettings={() => setShowSettings(true)}
              onShowWorkflows={() => setShowWorkflows(true)}
              onShowNotifications={() => setShowNotifications(true)}
              onToggleLog={handleToggleLog}
              showLog={showExecutionLog}
            />
            <div className="content-area">
              <Canvas onNodeSelect={handleNodeSelect} onContextMenu={handleContextMenu} />
              {showDemoGallery && <DemoGallery onClose={handleCloseDemos} />}
              {showExecutionLog && <ExecutionLog onClose={handleToggleLog} />}
              {helpModule && <HelpPanel module={helpModule} onClose={handleCloseHelp} />}
              {selectedNodeId && nodes.find(n => n.id === selectedNodeId) && (
                <ConfigPanel
                  node={nodes.find(n => n.id === selectedNodeId)}
                  onShowHelp={handleShowHelp}
                  onClose={handleCloseConfig}
                />
              )}
              {contextMenu && (
                <ContextMenu
                  x={contextMenu.x}
                  y={contextMenu.y}
                  type={contextMenu.type}
                  nodeId={contextMenu.nodeId}
                  onClose={handleCloseContextMenu}
                  onAddNode={handleAddNodeFromMenu}
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                />
              )}
            </div>
        </div>
        {!showDemoGallery && <CopilotPanel />}
      </div>
      
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showWorkflows && <WorkflowsModal onClose={() => setShowWorkflows(false)} />}
      {showNotifications && <NotificationsModal notifications={notificationsHistory} onClose={() => setShowNotifications(false)} />}

      {/* --- TELEPHONE CALL SIMULATOR MODAL --- */}
      {activeCall && (
        <div className="call-overlay">
          <div className="call-modal">
            {/* Pulsing Avatar */}
            <div className={`call-header-avatar ${callStatus === 'active' ? (isAiResponding || speechSynthesisActive ? 'active' : 'ringing') : ''}`}>
              <Phone size={32} style={{ transform: callStatus === 'active' ? 'none' : 'rotate(135deg)', transition: 'all 0.5s' }} />
            </div>

            {/* Title & Info */}
            <div className="call-title">{activeCall.label}</div>
            <div className="call-subtitle">
              <span>{callStatus === 'active' ? 'Appel en cours...' : 'Appel terminé'}</span>
              <span>•</span>
              <span>{Math.floor(callDuration / 60).toString().padStart(2, '0')}:{Math.floor(callDuration % 60).toString().padStart(2, '0')}</span>
            </div>

            {/* Interactive Audio Waveform */}
            <div className={`call-waveform ${(isAiResponding || speechSynthesisActive) ? 'speaking' : (speechRecognitionActive ? 'listening' : '')}`}>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '24px' : '8px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '12px' : '6px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '32px' : '10px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '16px' : '4px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '28px' : '8px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '8px' : '5px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '20px' : '7px' }}></div>
              <div className="call-wave-bar" style={{ height: (isAiResponding || speechSynthesisActive) ? '14px' : '9px' }}></div>
            </div>

            {/* Transcript scrolling chat log */}
            <div className="call-transcript-container">
              {callHistory.map((turn, idx) => (
                <div key={idx} className={`call-bubble ${turn.role}`}>
                  {turn.text}
                </div>
              ))}
              {isAiResponding && (
                <div className="call-bubble agent" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span className="dot-blink" style={{ width: '6px', height: '6px', background: 'var(--text)', borderRadius: '50%' }}></span>
                  <span className="dot-blink" style={{ width: '6px', height: '6px', background: 'var(--text)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                  <span className="dot-blink" style={{ width: '6px', height: '6px', background: 'var(--text)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Final Consequence Badge */}
            {actionConsequence && (
              <div className="call-consequence-badge" title={actionConsequence}>
                🎯 Résultat : {actionConsequence}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="call-controls">
              {callStatus === 'active' ? (
                <>
                  <div className="call-input-wrapper">
                    <input 
                      type="text" 
                      className="call-input-field" 
                      placeholder={speechRecognitionActive ? "Parlez maintenant..." : "Écrivez un message..."}
                      value={callInputText}
                      onChange={e => setCallInputText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendCallMessage(callInputText)}
                      disabled={isAiResponding}
                    />
                    
                    {/* Voice Recognition Toggle Button */}
                    <button 
                      className={`call-voice-toggle ${isVoiceMode ? 'active' : ''}`}
                      onClick={() => setIsVoiceMode(prev => !prev)}
                      title={isVoiceMode ? "Désactiver la voix" : "Activer la voix (Parler)"}
                      disabled={isAiResponding}
                    >
                      {isVoiceMode ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>

                    <button 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '6px' }}
                      onClick={() => handleSendCallMessage(callInputText)}
                      disabled={isAiResponding || !callInputText.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  <button className="call-hangup-btn" onClick={handleHangUp} title="Raccrocher">
                    <PhoneOff size={20} />
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--danger)' }}>
                  Appel Terminé
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {updateReady && (
        <div className="update-banner">
          <span>Une nouvelle version est prête à être installée !</span>
          <button 
            className="btn-primary" 
            style={{ padding: '4px 12px', fontSize: '13px', marginLeft: '12px' }}
            onClick={() => window.electronAPI.installUpdate()}
          >
            Redémarrer et Installer
          </button>
        </div>
      )}

      <div className="app-version">{appVersion}</div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <WorkflowProvider>
        <ExecutionProvider>
          <ReactFlowProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ReactFlowProvider>
        </ExecutionProvider>
      </WorkflowProvider>
    </ThemeProvider>
  )
}
