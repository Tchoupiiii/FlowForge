import React from 'react'
import { ArrowLeft, Cloud, FileJson, MessageSquare, Activity, MapPin, BarChart, Bitcoin, Rss, Github, Heart, LineChart, Calendar, Terminal, Layout } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'

// Import demos
import weatherDemo from '../demos/weatherNotification'
import csvDemo from '../demos/csvToJson'
import webhookDemo from '../demos/webhookAi'
import apiDemo from '../demos/apiMonitor'
import shopDemo from '../demos/shopFinder'
import sentimentDemo from '../demos/sentimentAnalysis'
import cryptoDiscordDemo from '../demos/cryptoDiscord'
import rssSlackDemo from '../demos/rssSlack'
import githubTranslateDemo from '../demos/githubTranslateDemo'
import healthDemo from '../demos/healthDemo'
import financeDemo from '../demos/financeDemo'
import planningDemo from '../demos/planningDemo'
import systemMonitorDemo from '../demos/systemMonitorDemo'
import trelloCardDemo from '../demos/trelloCardDemo'
const DEMOS = [
  { ...weatherDemo(), icon: Cloud, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { ...csvDemo(), icon: FileJson, gradient: 'linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%)' },
  { ...webhookDemo(), icon: MessageSquare, gradient: 'linear-gradient(135deg, #c084fc 0%, #818cf8 100%)' },
  { ...apiDemo(), icon: Activity, gradient: 'linear-gradient(135deg, #fb923c 0%, #f87171 100%)' },
  { ...shopDemo(), icon: MapPin, gradient: 'linear-gradient(135deg, #fb7185 0%, #e879f9 100%)' },
  { ...sentimentDemo(), icon: BarChart, gradient: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)' },
  { ...cryptoDiscordDemo(), icon: Bitcoin, gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { ...rssSlackDemo(), icon: Rss, gradient: 'linear-gradient(135deg, #f97316 0%, #E01E5A 100%)' },
  { ...githubTranslateDemo(), icon: Github, gradient: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)' },
  { ...healthDemo(), icon: Heart, gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
  { ...financeDemo(), icon: LineChart, gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { ...planningDemo(), icon: Calendar, gradient: 'linear-gradient(135deg, #4285F4 0%, #1e40af 100%)' },
  { ...systemMonitorDemo(), icon: Terminal, gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' },
  { ...trelloCardDemo(), icon: Layout, gradient: 'linear-gradient(135deg, #0079bf 0%, #0284c7 100%)' }
]

export default function DemoGallery({ onClose }) {
  const { loadDemoWorkflow } = useWorkflow()

  const handleLoad = (demo) => {
    loadDemoWorkflow(demo)
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
