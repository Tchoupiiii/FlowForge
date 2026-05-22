import React from 'react'
import { ArrowLeft, Cloud, FileJson, MessageSquare, Activity, MapPin, BarChart, Bitcoin, Rss, Github, Heart, LineChart, Calendar, Terminal, Layout, Repeat } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'

import { DEMOS as RAW_DEMOS } from '../demos'

const DEMOS = RAW_DEMOS.map((demo, i) => ({
  ...demo,
  icon: i % 2 === 0 ? Bitcoin : Activity,
  gradient: i % 2 === 0 
    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' 
    : 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
}))

export default function DemoGallery({ onClose }) {
  const { loadDemoWorkflow } = useWorkflow()

  const handleLoad = (demo) => {
    // Add default handles if not present
    const processedDemo = {
      ...demo,
      edges: (demo.edges || []).map(e => ({
        sourceHandle: 'a', 
        targetHandle: 'a', 
        ...e 
      }))
    }
    loadDemoWorkflow(processedDemo)
    onClose()
  }

  return (
    <div className="demo-gallery">
      <div className="demo-gallery-header">
        <button className="demo-back-btn" onClick={onClose}>
          <ArrowLeft size={18} />
          <span>Retour à l'éditeur</span>
        </button>
        <div>
          <h2 className="demo-gallery-title">Workflows Démo</h2>
          <p className="demo-gallery-subtitle">Chargez un workflow pré-construit pour découvrir FlowForge</p>
        </div>
      </div>

      <div className="demo-grid">
        {DEMOS.map((demo, i) => {
          const Icon = demo.icon
          return (
            <div key={i} className="demo-card" onClick={() => handleLoad(demo)}>
              <div className="demo-card-visual" style={{ background: demo.gradient }}>
                <Icon size={40} color="white" />
              </div>
              <div className="demo-card-content">
                <h3 className="demo-card-title">{demo.name}</h3>
                <p className="demo-card-desc">{demo.description}</p>
                <div className="demo-card-tags">
                  {demo.tags && demo.tags.map(tag => (
                    <span key={tag} className="demo-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
