import React, { useEffect, useRef } from 'react'
import { Trash2, Copy, Plus, Zap, Brain, MapPin, Send, MessageCircle } from 'lucide-react'
import { MODULE_DEFINITIONS, ICON_MAP, getCategories, getCategoryLabel } from '../data/moduleDefinitions'

const CATEGORY_ICONS = { core: Zap, ai: Brain, map: MapPin, telegram: Send }

export default function ContextMenu({ x, y, type, nodeId, onClose, onAddNode, onDeleteNode, onDuplicateNode }) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  // Adjust position to keep menu in viewport
  const style = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 9999
  }

  if (type === 'node') {
    return (
      <div className="context-menu" style={style} ref={ref}>
        <button className="context-menu-item" onClick={() => { onDuplicateNode(nodeId); onClose() }}>
          <Copy size={14} />
          <span>Dupliquer</span>
        </button>
        <div className="context-menu-separator" />
        <button className="context-menu-item context-menu-item-danger" onClick={() => { onDeleteNode(nodeId); onClose() }}>
          <Trash2 size={14} />
          <span>Supprimer</span>
        </button>
      </div>
    )
  }

  // Canvas context menu — categorized module list
  const categories = getCategories()

  return (
    <div className="context-menu context-menu-large" style={style} ref={ref}>
      <div className="context-menu-header">Ajouter un module</div>
      {categories.map(cat => {
        const modules = MODULE_DEFINITIONS.filter(m => m.category === cat)
        const CatIcon = CATEGORY_ICONS[cat] || Zap
        return (
          <div key={cat} className="context-menu-group">
            <div className="context-menu-group-label">
              <CatIcon size={12} />
              <span>{getCategoryLabel(cat)}</span>
            </div>
            {modules.map(mod => {
              const Icon = ICON_MAP[mod.icon]
              return (
                <button
                  key={mod.type}
                  className="context-menu-item"
                  onClick={() => { onAddNode(mod.type, { x: x - 260, y: y - 100 }); onClose() }}
                >
                  <span className="context-menu-item-dot" style={{ background: mod.color }} />
                  {Icon && <Icon size={14} style={{ color: mod.color }} />}
                  <span>{mod.label}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
