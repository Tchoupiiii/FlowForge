import React, { useState, useMemo } from 'react'
import { Search, Zap, Brain, MapPin, Send, Folder, Trash2 } from 'lucide-react'
import { MODULE_DEFINITIONS, ICON_MAP, getCategories, getCategoryLabel } from '../data/moduleDefinitions'
import { useWorkflow } from '../context/WorkflowContext'

const CATEGORY_ICONS = { core: Zap, ai: Brain, map: MapPin, telegram: Send }

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('modules')
  const [search, setSearch] = useState('')
  const categories = getCategories()
  
  const { savedWorkflows, loadWorkflow, deleteWorkflow } = useWorkflow()

  const filtered = useMemo(() => {
    if (!search.trim()) return MODULE_DEFINITIONS
    const q = search.toLowerCase()
    return MODULE_DEFINITIONS.filter(m =>
      m.label.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    )
  }, [search])

  const onDragStart = (e, moduleType) => {
    e.dataTransfer.setData('application/flowforge-node', moduleType)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        <div 
          onClick={() => setActiveTab('modules')}
          style={{ flex: 1, padding: '12px 0', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'modules' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'modules' ? 'white' : 'var(--text-secondary)' }}
        >
          Modules
        </div>
        <div 
          onClick={() => setActiveTab('projects')}
          style={{ flex: 1, padding: '12px 0', textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'projects' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'projects' ? 'white' : 'var(--text-secondary)' }}
        >
          Projets
        </div>
      </div>

      {activeTab === 'modules' && (
        <>
          <div className="sidebar-header">
            <div className="sidebar-search">
              <div className="sidebar-search-wrapper">
                <Search size={16} className="sidebar-search-icon" />
                <input
                  type="text"
                  className="sidebar-search-input"
                  placeholder="Rechercher un module..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="sidebar-modules">
            {categories.map(cat => {
              const modules = filtered.filter(m => m.category === cat)
              if (modules.length === 0) return null
              const CatIcon = CATEGORY_ICONS[cat] || Zap

              return (
                <div key={cat}>
                  <div className="sidebar-category">
                    <CatIcon size={14} />
                    <span>{getCategoryLabel(cat)}</span>
                  </div>
                  <div className="sidebar-category-items">
                    {modules.map(mod => {
                      const Icon = ICON_MAP[mod.icon]
                      return (
                        <div
                          key={mod.type}
                          className="sidebar-item"
                          draggable
                          onDragStart={(e) => onDragStart(e, mod.type)}
                          title={mod.help?.description || mod.label}
                        >
                          <div className="sidebar-item-icon" style={{ background: `${mod.color}18`, color: mod.color }}>
                            {Icon && <Icon size={16} />}
                          </div>
                          <span className="sidebar-item-label">{mod.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="sidebar-modules" style={{ padding: '10px' }}>
          <div style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            Double-cliquez pour ouvrir un projet.
          </div>
          {savedWorkflows.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>
              Aucun projet sauvegardé.
            </div>
          ) : (
            savedWorkflows.map(wf => (
              <div 
                key={wf.id} 
                onDoubleClick={() => loadWorkflow(wf.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px', backgroundColor: 'var(--bg-dark)', 
                  borderRadius: '6px', marginBottom: '8px', cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Folder size={16} color="var(--accent)" />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '13px' }}>
                    {wf.name || 'Projet sans nom'}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteWorkflow(wf.id) }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
