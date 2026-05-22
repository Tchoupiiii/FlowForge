import React from 'react'
import { Plus, X } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'

export default function TabBar() {
  const { tabs, activeTabId, createNewTab, closeTab, switchTab } = useWorkflow()

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div 
          key={tab.tabId} 
          className={`tab-item ${activeTabId === tab.tabId ? 'active' : ''}`}
          onClick={() => switchTab(tab.tabId)}
        >
          <span className="tab-title" title={tab.workflowName}>
            {tab.workflowName || 'Nouveau Workflow'}
            {!tab.workflowId && <span className="tab-unsaved-dot"></span>}
          </span>
          <button 
            className="tab-close-btn" 
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.tabId)
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button className="tab-new-btn" onClick={createNewTab} title="Nouvel onglet">
        <Plus size={16} />
      </button>
    </div>
  )
}
