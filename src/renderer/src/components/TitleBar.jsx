import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export default function TitleBar() {
  const handleMinimize = () => window.electronAPI?.minimize()
  const handleMaximize = () => window.electronAPI?.maximize()
  const handleClose = () => window.electronAPI?.close()

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <span className="titlebar-name">FlowForge</span>
      </div>
      <div className="titlebar-buttons">
        <button className="titlebar-button" onClick={handleMinimize} title="Réduire">
          <Minus size={14} />
        </button>
        <button className="titlebar-button" onClick={handleMaximize} title="Agrandir">
          <Square size={12} />
        </button>
        <button className="titlebar-button titlebar-close" onClick={handleClose} title="Fermer">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
