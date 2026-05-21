import React, { useState } from 'react'
import { X, BookOpen, Layers, Target, HelpCircle } from 'lucide-react'

export default function GuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('intro')

  const TABS = [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'tutorial', label: 'Tutoriel Rapide', icon: Target },
    { id: 'modules', label: 'Les Modules', icon: Layers },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ]

  return (
    <div className="help-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="guide-modal slide-in-bottom">
        <div className="guide-header">
          <div className="guide-title">
            <BookOpen size={24} color="var(--accent)" />
            <h2>Guide d'utilisation FlowForge</h2>
          </div>
          <button className="help-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="guide-content-layout">
          <div className="guide-sidebar">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`guide-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="guide-body">
            {activeTab === 'intro' && (
              <div className="guide-section">
                <h3>Bienvenue dans FlowForge ! 🎉</h3>
                <p>FlowForge est votre outil de création de workflows automatisés sans code (no-code). Il vous permet de connecter des API, des bases de données, des modèles d'intelligence artificielle et des services de messagerie très simplement.</p>
                <div className="guide-highlight">
                  <strong>Concept clé :</strong>
                  <p>Un workflow est constitué de <strong>nœuds</strong> (des actions ou déclencheurs) reliés par des <strong>liens</strong>. Les données voyagent du premier nœud vers le dernier.</p>
                </div>
              </div>
            )}

            {activeTab === 'tutorial' && (
              <div className="guide-section">
                <h3>Créer votre premier workflow</h3>
                <ol className="guide-steps">
                  <li><strong>Ajouter un déclencheur :</strong> Ouvrez le menu de gauche et glissez-déposez le nœud <em>Trigger Manuel</em> ou <em>Timer / Cron</em> sur la grille.</li>
                  <li><strong>Ajouter une action :</strong> Glissez un nœud <em>Envoi Discord</em> ou <em>Notification</em>.</li>
                  <li><strong>Connecter les nœuds :</strong> Cliquez sur le point à droite de votre déclencheur, et glissez vers le point à gauche de votre action.</li>
                  <li><strong>Configurer :</strong> Cliquez sur un nœud. Un panneau s'ouvre à droite pour paramétrer le nœud (ex: URL du Webhook).</li>
                  <li><strong>Exécuter :</strong> Cliquez sur <em>▶️ Exécuter</em> dans la barre d'outils !</li>
                </ol>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="guide-section">
                <h3>Comprendre les Modules</h3>
                <p>FlowForge dispose de 4 catégories principales :</p>
                <ul className="guide-list">
                  <li><strong style={{color: 'var(--accent)'}}>Core :</strong> Logique de base (HTTP, JSON, Filtre, Trigger, Lecture de fichier, Discord, Slack, RSS).</li>
                  <li><strong style={{color: '#818cf8'}}>Intelligence Artificielle :</strong> Agents, Classificateurs et analyseurs avec OpenAI ou Ollama.</li>
                  <li><strong style={{color: '#fb7185'}}>Carte :</strong> Modules pour rechercher et afficher des coordonnées géographiques (OpenStreetMap).</li>
                  <li><strong style={{color: '#0088cc'}}>Telegram :</strong> Écouter les messages d'un bot ou en envoyer.</li>
                </ul>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="guide-section">
                <h3>Foire Aux Questions</h3>
                <div className="faq-item">
                  <strong>Comment utiliser l'IA 100% locale ?</strong>
                  <p>Téléchargez <a href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a>. FlowForge détectera automatiquement vos modèles (llama3, mistral) installés localement. Sélectionnez "ollama" comme fournisseur dans vos modules IA.</p>
                </div>
                <div className="faq-item">
                  <strong>Mes modules de messagerie ne s'envoient pas. Pourquoi ?</strong>
                  <p>Vérifiez que vous avez correctement renseigné le Webhook (pour Slack/Discord) ou le Bot Token et le Chat ID (pour Telegram) en cliquant sur le nœud concerné.</p>
                </div>
                <div className="faq-item">
                  <strong>Le Workflow Copilot ne marche pas ?</strong>
                  <p>Le Copilot a besoin d'une connexion internet si vous utilisez OpenAI, ou que Ollama soit lancé en arrière-plan (port 11434 par défaut) si vous utilisez l'IA locale.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
