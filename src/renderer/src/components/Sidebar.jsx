import React, { useState, useMemo } from 'react'
import { Search, Zap, Brain, MapPin, Send, Folder, Trash2, Plus } from 'lucide-react'
import { MODULE_DEFINITIONS, ICON_MAP, getCategories, getCategoryLabel } from '../data/moduleDefinitions'
import { useWorkflow } from '../context/WorkflowContext'

const CATEGORY_ICONS = { core: Zap, ai: Brain, map: MapPin, telegram: Send }

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('modules')
  const [search, setSearch] = useState('')
  const [width, setWidth] = useState(260)
  const categories = getCategories()
  
  const { savedWorkflows, loadWorkflow, deleteWorkflow, clearCanvas, setWorkflowName } = useWorkflow()

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setWidth(Math.max(150, Math.min(newWidth, window.innerWidth / 2)));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', width: `${width}px`, position: 'relative' }}>
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          right: -2,
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

    </div>
  )
}
