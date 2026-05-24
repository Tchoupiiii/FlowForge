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
              <>
                <div className="guide-section">
                  <h3>Comprendre les Modules</h3>
                  <p>FlowForge dispose de plusieurs catégories de modules pour concevoir des processus puissants :</p>
                  <ul className="guide-list">
                    <li><strong style={{color: 'var(--accent)'}}>Core :</strong> Logique de base (HTTP, JSON, Filtre, Trigger, Lecture/Écriture de fichiers, Discord, Slack, RSS).</li>
                    <li><strong style={{color: '#818cf8'}}>Intelligence Artificielle :</strong> Agents autonomes, Chat GPT, Classificateurs et analyseurs avec OpenAI ou Ollama.</li>
                    <li><strong style={{color: '#10b981'}}>Agent Téléphonique (Nouveau) :</strong> Simule une IA vocale répondant en moins de 500ms pour répondre à des questions sur l'entreprise ou prendre rendez-vous.</li>
                    <li><strong style={{color: '#a78bfa'}}>Synthèse Vocale TTS (Nouveau) :</strong> Génère des fichiers audio (.mp3) parlés à partir de textes (via l'API Google Translate).</li>
                    <li><strong style={{color: '#34d399'}}>Finance & Divers :</strong> Cours de bourse, crypto-monnaies, APIs externes (FDA, Google Calendar, Trello, Notion, GitHub).</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>Utiliser les Variables & Fallbacks</h3>
                  <p>Injectez des données dynamiques du nœud précédent dans le nœud suivant via la syntaxe <strong>&#123;&#123;input.nom_du_champ&#125;&#125;</strong> ou <strong>&#123;&#123;items&#125;&#125;</strong>.</p>
                  <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', margin: '10px 0' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--accent)' }}>Fonctionnement des Fallbacks Automatiques :</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                      <li><strong>Pas besoin de configurer !</strong> Si vous connectez un nœud (ex: Lecture RSS) à un nœud de messagerie (ex: Discord Webhook) sans écrire de message, FlowForge formatera automatiquement le résultat.</li>
                      <li><strong>Flux RSS :</strong> Si l'input contient une liste d'articles (<code>items</code>), le message affichera automatiquement la liste à puces des 5 derniers articles.</li>
                      <li><strong>Lieux (Cartes) :</strong> Les adresses trouvées seront listées proprement de façon textuelle.</li>
                      <li><strong>Variables de sortie standard :</strong> Tous les modules exportent désormais une variable de résultat uniforme <code>result</code> pour simplifier les liaisons.</li>
                    </ul>
                  </div>
                </div>

                <div className="guide-section">
                  <h3>Agent Téléphonique Vocal & TTS</h3>
                  <p>Le module <strong>Agent Téléphonique</strong> simule un répondeur vocal intelligent à faible latence (inférieure à 500ms).</p>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                    <li><strong>Intégration d'agenda :</strong> S'il détecte une intention de rendez-vous dans la question (ex: "Je veux réserver pour demain"), il interroge l'agenda partagé de l'application. En cas de conflit, il propose un autre créneau libre, puis insère l'événement !</li>
                    <li><strong>FAQ d'entreprise :</strong> L'agent répond intelligemment aux questions sur l'activité (basé sur la Description) ou sur les prix (basé sur Produits/Tarifs).</li>
                    <li><strong>Liaison TTS :</strong> En reliant la sortie <code>response</code> (Réponse Vocale) du nœud de l'Agent au nœud <strong>Synthèse Vocale (TTS)</strong>, vous générez instantanément une URL audio écoutable (.mp3).</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>Utiliser les Boucles (Loops)</h3>
                  <p>Le module <strong>Boucle (Loop)</strong> permet de traiter un tableau d'éléments un par un.</p>
                  <ul>
                    <li><strong>Champ tableau</strong> : Le nom de la clé contenant votre tableau (ex: <code>items</code>). Si laissé vide ou introuvable, FlowForge cherchera automatiquement le premier tableau dans les données d'entrée.</li>
                    <li><strong>Max itérations</strong> : Pratique pour tester, cela limite le nombre d'éléments traités.</li>
                  </ul>
                  <p>Connectez simplement la sortie du nœud Boucle au nœud suivant. Ce dernier sera exécuté <em>pour chaque élément</em> du tableau !</p>
                </div>

                <div className="guide-section">
                  <h3>Raccourcis Clavier</h3>
                  <p>Pour aller plus vite dans votre création :</p>
                  <ul>
                    <li><strong>Ctrl + C / Cmd + C</strong> : Copier les nœuds sélectionnés</li>
                    <li><strong>Ctrl + V / Cmd + V</strong> : Coller les nœuds copiés</li>
                    <li><strong>Ctrl + Z / Cmd + Z</strong> : Annuler la dernière action (Undo)</li>
                    <li><strong>Ctrl + Y / Cmd + Y</strong> : Refaire l'action annulée (Redo)</li>
                    <li><strong>Suppr / Backspace</strong> : Supprimer l'élément sélectionné</li>
                  </ul>
                </div>
              </>
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
