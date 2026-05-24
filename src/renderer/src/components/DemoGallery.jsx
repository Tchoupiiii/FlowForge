import React from 'react'
import { ArrowLeft, Cloud, FileJson, MessageSquare, Activity, MapPin, BarChart, Bitcoin, Rss, Github, Heart, LineChart, Calendar, Terminal, Layout, Repeat, Phone } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'

import { DEMOS as RAW_DEMOS } from '../demos'
import { MODULE_DEFINITIONS } from '../data/moduleDefinitions'

const getIconAndGradient = (demo) => {
  if (demo.id === 'demo-phone-agent') return { icon: Phone, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
  if (demo.id === 'demo-crypto-bot') return { icon: Bitcoin, gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }
  if (demo.id === 'demo-api-monitor') return { icon: Activity, gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }
  if (demo.id === 'demo-macro-economy') return { icon: BarChart, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }
  if (demo.id === 'demo-weather') return { icon: Cloud, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }
  if (demo.id === 'demo-loop') return { icon: Repeat, gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }
  return { icon: Layout, gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' }
}


const DEMOS = RAW_DEMOS.map((demo) => ({
  ...demo,
  ...getIconAndGradient(demo)
}))

export default function DemoGallery({ onClose }) {
  const { loadDemoWorkflow } = useWorkflow()

  const handleLoad = (demo) => {
    const processedDemo = {
      ...demo,
      nodes: (demo.nodes || []).map(n => {
        const rawType = n.data?.type || n.type
        const modDef = MODULE_DEFINITIONS.find(m => m.type === rawType)
        if (modDef) {
          return {
            ...n,
            type: 'customNode',
            data: {
              ...n.data,
              type: modDef.type,
              label: n.data?.label || modDef.label,
              icon: modDef.icon,
              color: n.data?.color || modDef.color,
              category: modDef.category,
              inputs: modDef.inputs,
              outputs: modDef.outputs,
              status: 'idle'
            }
          }
        }
        return n
      }),
      edges: (demo.edges || []).map(e => ({
        ...e,
        sourceHandle: 'a', 
        targetHandle: 'a'
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
