import React, { useState, useCallback, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
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

  const { addNode, nodes, setNodes, setEdges, activeTabId } = useWorkflow()

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
              onShowCopilot={handleToggleCopilot}
              onShowSettings={() => setShowSettings(true)}
              onShowWorkflows={() => setShowWorkflows(true)}
              onShowNotifications={() => setShowNotifications(true)}
              onToggleLog={handleToggleLog}
              showLog={showExecutionLog}
            />
          <div className="content-area">
            {showDemoGallery ? (
              <DemoGallery onClose={handleCloseDemos} />
            ) : (
              <>
                <Canvas onNodeSelect={handleNodeSelect} onContextMenu={handleContextMenu} />
                {selectedNodeId && nodes.find(n => n.id === selectedNodeId) && (
                  <ConfigPanel
                    node={nodes.find(n => n.id === selectedNodeId)}
                    onShowHelp={handleShowHelp}
                    onClose={handleCloseConfig}
                  />
                )}
              </>
            )}
          </div>
          {showExecutionLog && (
            <ExecutionLog onClose={() => setShowExecutionLog(false)} />
          )}
        </div>
        {showCopilot && (
          <CopilotPanel onClose={() => setShowCopilot(false)} />
        )}
      </div>
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
      {helpModule && (
        <HelpPanel module={helpModule} onClose={handleCloseHelp} />
      )}
      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      {showWorkflows && (
        <WorkflowsModal onClose={() => setShowWorkflows(false)} />
      )}
      {showNotifications && (
        <NotificationsModal notifications={notificationsHistory} onClose={() => setShowNotifications(false)} />
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
