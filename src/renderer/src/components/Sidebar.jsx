import React, { useState, useMemo } from 'react'
import { Search, Zap, Brain, MapPin, Send } from 'lucide-react'
import { MODULE_DEFINITIONS, ICON_MAP, getCategories, getCategoryLabel } from '../data/moduleDefinitions'

const CATEGORY_ICONS = { core: Zap, ai: Brain, map: MapPin, telegram: Send }

export default function Sidebar() {
  const [search, setSearch] = useState('')
  const categories = getCategories()

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
    <div className="sidebar">
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
