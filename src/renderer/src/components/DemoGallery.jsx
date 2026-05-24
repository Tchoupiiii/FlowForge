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
            <filter id="phoneBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="28" fill="url(#phoneG)" opacity="0.35" filter="url(#phoneBlur)" />
          <rect x="110" y="20" width="55" height="60" rx="5" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
          <line x1="118" y1="35" x2="145" y2="35" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="118" y1="48" x2="138" y2="48" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="118" y1="61" x2="148" y2="61" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="145" cy="72" r="3.5" fill="#34d399" />
          <g transform="translate(36, 36) scale(1.15)">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" 
              fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <path d="M 80 35 A 18 18 0 0 1 80 65" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M 88 27 A 30 30 0 0 1 88 73" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5">
            <animate attributeName="opacity" values="0.1;0.7;0.1" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </path>
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
            <filter id="cryptoB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>
          <circle cx="70" cy="50" r="26" fill="url(#cryptoG)" opacity="0.35" filter="url(#cryptoB)" />
          <g transform="translate(125, 20) scale(0.9)">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <circle cx="70" cy="50" r="20" fill="url(#cryptoG)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <path d="M70 38v24M73 38v24M65 43h10a4.5 4.5 0 0 1 0 9h-10M65 48h11a4.5 4.5 0 0 1 0 9h-11" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M120,65 L125,65 M122.5,62.5 L122.5,67.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
          </path>
        </svg>
      )
    case 'demo-api-monitor':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="apiG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="apiB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>
          <rect x="30" y="30" width="140" height="40" rx="6" fill="url(#apiG)" opacity="0.3" filter="url(#apiB)" />
          {/* EKG Line */}
          <path d="M 20 50 L 50 50 L 60 25 L 70 75 L 80 40 L 90 60 L 100 50 L 130 50 L 140 30 L 150 70 L 160 50 L 180 50" 
            fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0" dur="4s" repeatCount="indefinite" />
          </path>
          {/* Pulse DOT */}
          <circle cx="100" cy="50" r="4" fill="white">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    case 'demo-macro-economy':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="macroG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Bars */}
          <rect x="40" y="55" width="12" height="25" rx="2" fill="rgba(255,255,255,0.2)" />
          <rect x="60" y="45" width="12" height="35" rx="2" fill="rgba(255,255,255,0.4)" />
          <rect x="80" y="30" width="12" height="50" rx="2" fill="rgba(255,255,255,0.6)" />
          <rect x="100" y="20" width="12" height="60" rx="2" fill="url(#macroG)" />
          {/* Rising Chart Line */}
          <path d="M 30 75 L 50 65 L 70 50 L 90 35 L 110 25 L 130 15 L 150 10" 
            fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arrow */}
          <path d="M 140 10 L 150 10 L 150 20" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* RSS Signal */}
          <path d="M 140 70 A 15 15 0 0 1 165 95" stroke="white" strokeWidth="2.5" fill="none" opacity="0.7" />
          <path d="M 140 80 A 8 8 0 0 1 153 95" stroke="white" strokeWidth="2.5" fill="none" opacity="0.7" />
          <circle cx="143" cy="92" r="2.5" fill="white" />
        </svg>
      )
    case 'demo-weather':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="weatherG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <filter id="weatherB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
            </filter>
          </defs>
          <circle cx="70" cy="40" r="20" fill="#f59e0b" opacity="0.3" filter="url(#weatherB)" />
          <circle cx="70" cy="40" r="15" fill="#f59e0b" />
          {/* Fluffy Cloud */}
          <path d="M120 60 a18 18 0 0 1 18 -18 a22 22 0 0 1 35 3 a15 15 0 0 1 12 15 a15 15 0 0 1 -15 15 h-50 a15 15 0 0 1 0 -30 z" 
            fill="url(#weatherG)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          {/* Rain lines */}
          <line x1="135" y1="80" x2="130" y2="92" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="y1" values="80;85;80" dur="1s" repeatCount="indefinite" />
            <animate attributeName="y2" values="92;97;92" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="150" y1="80" x2="145" y2="92" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="y1" values="82;87;82" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="y2" values="94;99;94" dur="1.2s" repeatCount="indefinite" />
          </line>
          <line x1="165" y1="80" x2="160" y2="92" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="y1" values="79;84;79" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y2" values="91;96;91" dur="0.8s" repeatCount="indefinite" />
          </line>
        </svg>
      )
    case 'demo-loop':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="loopG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
            <filter id="loopB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
            </filter>
          </defs>
          <circle cx="100" cy="50" r="25" fill="none" stroke="url(#loopG)" strokeWidth="6" opacity="0.3" filter="url(#loopB)" />
          {/* Looping arrows */}
          <path d="M 100 25 A 25 25 0 0 1 125 50" fill="none" stroke="#f472b6" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 125 50 A 25 25 0 0 1 100 75" fill="none" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 100 75 A 25 25 0 0 1 75 50" fill="none" stroke="#be185d" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 75 50 A 25 25 0 0 1 100 25" fill="none" stroke="#db2777" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arrow heads */}
          <path d="M 103 21 L 100 25 L 104 29" fill="none" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 97 71 L 100 75 L 96 79" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" />
          {/* Counter blocks inside */}
          <text x="100" y="55" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">1..5</text>
        </svg>
      )
    case 'demo-webscraper':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="scrapG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          {/* Web Browser Frame */}
          <rect x="25" y="20" width="70" height="60" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
          <line x1="25" y1="32" x2="95" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <circle cx="31" cy="26" r="1.5" fill="#ef4444" />
          <circle cx="36" cy="26" r="1.5" fill="#eab308" />
          <circle cx="41" cy="26" r="1.5" fill="#22c55e" />
          {/* Scraped Content Line */}
          <line x1="32" y1="42" x2="88" y2="42" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="52" x2="78" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="62" x2="83" y2="62" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
          {/* Pull Connection Dotted Arrow */}
          <path d="M 98 50 L 118 50" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="3,3" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" values="10;0" dur="1.5s" repeatCount="indefinite" />
          </path>
          {/* Summary Sheet on the right */}
          <rect x="122" y="20" width="50" height="60" rx="4" fill="url(#scrapG)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="130" y1="35" x2="164" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="130" y1="47" x2="158" y2="47" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="130" y1="59" x2="162" y2="59" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'demo-youtube':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ytG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="ytB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
            </filter>
          </defs>
          <rect x="25" y="25" width="70" height="50" rx="6" fill="url(#ytG)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <polygon points="53,42 53,58 67,50" fill="white" />
          {/* Sparkles arrow */}
          <path d="M 100 50 Q 115 40 130 50" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          {/* Twitter Card */}
          <rect x="135" y="30" width="45" height="40" rx="4" fill="#1da1f2" opacity="0.3" filter="url(#ytB)" />
          <rect x="135" y="30" width="45" height="40" rx="4" fill="#1da1f2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
          {/* Bird/Bubbles */}
          <circle cx="145" cy="40" r="3" fill="white" />
          <line x1="141" y1="50" x2="171" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="141" y1="58" x2="165" y2="58" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'demo-image':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="imgG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="imgB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
            </filter>
          </defs>
          {/* Glowing Canvas */}
          <rect x="40" y="15" width="120" height="70" rx="6" fill="url(#imgG)" opacity="0.25" filter="url(#imgB)" />
          <rect x="40" y="15" width="120" height="70" rx="6" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
          {/* Mountains in canvas */}
          <polygon points="40,84 75,45 105,84" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <polygon points="85,84 125,30 160,84" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          {/* Cosmic Sun/Moon */}
          <circle cx="135" cy="35" r="10" fill="#fef08a" />
          {/* Magic spark */}
          <path d="M 60 30 L 65 30 M 62.5 27.5 L 62.5 32.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 70 38 L 73 38 M 71.5 36.5 L 71.5 39.5" stroke="#f0abfc" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'demo-telegram-notion':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tgNotionG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="tgNotionB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="28" fill="url(#tgNotionG)" opacity="0.3" filter="url(#tgNotionB)" />
          {/* Telegram Plane */}
          <g transform="translate(35, 35)">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Sync arrows */}
          <path d="M 98 42 H 115" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 109 37 L 115 42 L 109 47" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Notion sheet database */}
          <rect x="130" y="20" width="45" height="60" rx="4" fill="rgba(255,255,255,0.06)" stroke="white" strokeWidth="1.5" />
          <line x1="130" y1="35" x2="175" y2="35" stroke="white" strokeWidth="1.2" />
          <rect x="136" y="44" width="33" height="8" rx="1.5" fill="rgba(59, 130, 246, 0.4)" />
          <rect x="136" y="58" width="33" height="8" rx="1.5" fill="rgba(255,255,255,0.15)" />
        </svg>
      )
    case 'demo-crypto-discord':
      return (
        <svg style={baseStyle} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="discG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="discB" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
            </filter>
          </defs>
          <circle cx="140" cy="50" r="28" fill="url(#discG)" opacity="0.35" filter="url(#discB)" />
          {/* Trend Crossing Limit */}
          <path d="M 20 70 L 50 65 L 75 35 L 100 20" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Limit Threshold line */}
          <line x1="20" y1="45" x2="105" y2="45" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
          {/* Discord logo on the right */}
          <g transform="translate(125, 35)">
            <path d="M19 6c-1.24-.08-2.03.22-2.03.22C15.4 4.5 13.3 4 10 4s-5.4.5-6.97 2.22c0 0-.79-.3-2.03-.22C.28 8.4-.53 13.06.33 19.3c0 0 1.9 2.7 4.97 2.7 0 0 .58-.7.98-1.3C4.26 20 3.03 18.8 2.25 17.5c0 0 .3.2.82.52.12.08.24.16.36.22 1.3.8 2.8 1.16 4.57 1.26 2.45.1 4.7-.2 6.78-1.26a12.66 12.66 0 0 0 1.2-.6c-.78 1.3-2 2.5-3.03 3.2.4.6.98 1.3.98 1.3 3.07 0 4.97-2.7 4.97-2.7.86-6.24.05-10.9-1.92-13.3z" 
              fill="white" opacity="0.9" />
          </g>
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
