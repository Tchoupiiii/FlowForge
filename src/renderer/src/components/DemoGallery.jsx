import React from 'react'
import { ArrowLeft, Cloud, FileJson, MessageSquare, Activity, MapPin, BarChart, Bitcoin, Rss, Github, Heart, LineChart, Calendar, Terminal, Layout, Repeat, Phone, Play, Image, Database, Send, AlertTriangle, Globe } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'

import { DEMOS as RAW_DEMOS } from '../demos'
import { MODULE_DEFINITIONS } from '../data/moduleDefinitions'

// Render a gorgeous animated inline SVG scene for each demo card
function DemoVisual({ id }) {
  const baseStyle = { width: '100%', height: '100%', display: 'block' }
  switch (id) {
    case 'demo-phone-agent':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="phoneG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="50" r="30" fill="url(#phoneG)" opacity="0.15" />
          <circle cx="100" cy="50" r="22" fill="url(#phoneG)" opacity="0.3" />
          <g transform="translate(88, 38) scale(1)">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" 
              fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Subtle audio waves */}
          <path d="M 60 50 Q 70 40 80 50 Q 90 60 100 50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          <path d="M 100 50 Q 110 40 120 50 Q 130 60 140 50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
        </svg>
      )
    case 'demo-crypto-bot':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cryptoG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="50" r="24" fill="url(#cryptoG)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path d="M100 38v24M103 38v24M95 43h10a4.5 4.5 0 0 1 0 9H95M95 48h11a4.5 4.5 0 0 1 0 9H95" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="140" cy="35" r="3" fill="#f59e0b" />
          <circle cx="60" cy="65" r="4" fill="#ef4444" opacity="0.7" />
        </svg>
      )
    case 'demo-api-monitor':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20 50 L 70 50 L 80 20 L 90 80 L 100 40 L 110 60 L 120 50 L 180 50" 
            fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0" dur="3s" repeatCount="indefinite" />
          </path>
          <circle cx="100" cy="40" r="3" fill="white">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    case 'demo-macro-economy':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          {/* Simple Clean Chart */}
          <rect x="50" y="60" width="10" height="20" rx="1.5" fill="rgba(255,255,255,0.2)" />
          <rect x="70" y="45" width="10" height="35" rx="1.5" fill="rgba(255,255,255,0.4)" />
          <rect x="90" y="30" width="10" height="50" rx="1.5" fill="rgba(255,255,255,0.7)" />
          <path d="M 40 75 L 75 50 L 95 40 L 130 18" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
          <polygon points="125,18 132,16 130,24" fill="#a78bfa" />
        </svg>
      )
    case 'demo-weather':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="75" cy="40" r="14" fill="#f59e0b" />
          {/* Minimal Cloud */}
          <path d="M95 55 a12 12 0 0 1 12 -12 a15 15 0 0 1 25 2 a10 10 0 0 1 8 10 a10 10 0 0 1 -10 10 H105 a10 10 0 0 1 -10 -10 z" 
            fill="#38bdf8" opacity="0.9" />
        </svg>
      )
    case 'demo-loop':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="50" r="20" fill="none" stroke="#f472b6" strokeWidth="3" opacity="0.3" />
          <path d="M 100 30 A 20 20 0 0 1 120 50" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
          <polygon points="117,26 123,30 119,34" fill="#ec4899" />
          <text x="100" y="55" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">1..5</text>
        </svg>
      )
    case 'demo-webscraper':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="45" y="25" width="55" height="50" rx="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="45" y1="35" x2="100" y2="35" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <rect x="110" y="35" width="45" height="40" rx="3" fill="#06b6d4" opacity="0.8" />
          <line x1="118" y1="48" x2="138" y2="48" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="118" y1="56" x2="148" y2="56" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'demo-youtube':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="45" y="30" width="55" height="40" rx="4" fill="#ef4444" />
          <polygon points="68,42 68,58 78,50" fill="white" />
          <path d="M 110 50 Q 125 40 140 50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="145" y="35" width="30" height="30" rx="3" fill="#1da1f2" />
        </svg>
      )
    case 'demo-image':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="50" y="20" width="100" height="60" rx="4" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
          <polygon points="50,79 80,45 110,79" fill="rgba(255,255,255,0.2)" />
          <polygon points="90,79 120,35 150,79" fill="rgba(255,255,255,0.3)" />
          <circle cx="130" cy="35" r="6" fill="#fef08a" />
        </svg>
      )
    case 'demo-telegram-notion':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(45, 35) scale(0.8)">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <path d="M 90 50 H 110" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="3,3" />
          <rect x="125" y="25" width="40" height="50" rx="3" fill="none" stroke="white" strokeWidth="1.5" />
          <line x1="125" y1="38" x2="165" y2="38" stroke="white" strokeWidth="1" />
        </svg>
      )
    case 'demo-crypto-discord':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 70 L 60 55 L 80 35 L 110 20" fill="none" stroke="#6366f1" strokeWidth="2" />
          <line x1="30" y1="45" x2="110" y2="45" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
          <rect x="130" y="35" width="35" height="30" rx="3" fill="#6366f1" />
        </svg>
      )
    default:
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="100" rx="6" fill="rgba(255,255,255,0.06)" />
          <circle cx="100" cy="50" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        </svg>
      )
  }
}

const getIconAndGradient = (demo) => {
  if (demo.id === 'demo-phone-agent') return { icon: Phone, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
  if (demo.id === 'demo-crypto-bot') return { icon: Bitcoin, gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }
  if (demo.id === 'demo-api-monitor') return { icon: Activity, gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }
  if (demo.id === 'demo-macro-economy') return { icon: BarChart, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }
  if (demo.id === 'demo-weather') return { icon: Cloud, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }
  if (demo.id === 'demo-loop') return { icon: Repeat, gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }
  if (demo.id === 'demo-webscraper') return { icon: Globe, gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }
  if (demo.id === 'demo-youtube') return { icon: Play, gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
  if (demo.id === 'demo-image') return { icon: Image, gradient: 'linear-gradient(135deg, #d946ef 0%, #c084fc 100%)' }
  if (demo.id === 'demo-telegram-notion') return { icon: Database, gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }
  if (demo.id === 'demo-crypto-discord') return { icon: Send, gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
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
      name: demo.name || demo.title || 'Démo',
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
        sourceHandle: e.sourceHandle || 'a', 
        targetHandle: e.targetHandle || 'a',
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--accent)', strokeWidth: 2 }
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
          return (
            <div key={i} className="demo-card" onClick={() => handleLoad(demo)}>
              <div className="demo-card-visual" style={{ background: demo.gradient, padding: 0, overflow: 'hidden' }}>
                <DemoVisual id={demo.id} />
              </div>
              <div className="demo-card-content">
                <h3 className="demo-card-title">{demo.name || demo.title}</h3>
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
