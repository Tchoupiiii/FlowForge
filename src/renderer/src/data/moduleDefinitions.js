import {
  Play, Clock, Globe, Anchor, GitBranch, RefreshCw, Mail,
  FolderOpen, Save, Code, Hourglass, Bell, Bot, Brain,
  Image, Tags, MapPin, MessageCircle, Send,
  MessageSquare, Hash, Rss, Filter, Bitcoin,
  Github, Languages, Heart, LineChart, Calendar, Database
} from 'lucide-react'

export const MODULE_DEFINITIONS = [
  // ──── Core ────
  {
    type: 'triggerManual', label: 'Trigger Manuel', icon: 'Play', color: '#4ade80', category: 'core',
    inputs: 0, outputs: 1, configFields: [],
    help: {
      description: 'Démarre un workflow manuellement en cliquant sur le bouton Run.',
      example: 'Cliquez sur ▶️ pour lancer le workflow.',
      tip: 'Utilisez ce nœud comme point de départ de tous vos workflows.'
    }
  },
  {
    type: 'timerCron', label: 'Timer / Cron', icon: 'Clock', color: '#fbbf24', category: 'core',
    inputs: 0, outputs: 1,
    configFields: [
      { key: 'interval', label: 'Intervalle (secondes)', type: 'number', default: 60 },
      { key: 'cron', label: 'Expression Cron', type: 'text', default: '' }
    ],
    help: {
      description: 'Déclenche le workflow à intervalles réguliers ou selon une expression cron.',
      example: 'Intervalle: 3600 = toutes les heures. Cron: */5 * * * * = toutes les 5 min.',
      tip: "Laissez le champ cron vide pour utiliser l'intervalle simple."
    }
  },
  {
    type: 'httpRequest', label: 'HTTP Request', icon: 'Globe', color: '#60a5fa', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'url', label: 'URL', type: 'text', default: 'https://api.example.com' },
      { key: 'method', label: 'Méthode', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', default: '{}' },
      { key: 'body', label: 'Body (JSON)', type: 'textarea', default: '' }
    ],
    help: {
      description: "Effectue une requête HTTP vers n'importe quelle API REST.",
      example: 'URL: https://api.weather.com/current\nMéthode: GET',
      tip: 'Utilisez {{input.field}} pour injecter des données dynamiques du nœud précédent.'
    }
  },
  {
    type: 'webhook', label: 'Webhook', icon: 'Anchor', color: '#c084fc', category: 'core',
    inputs: 0, outputs: 1,
    configFields: [
      { key: 'port', label: 'Port', type: 'number', default: 3000 },
      { key: 'path', label: 'Chemin', type: 'text', default: '/webhook' }
    ],
    help: {
      description: 'Crée un serveur HTTP qui écoute les requêtes entrantes.',
      example: 'Port: 3000, Chemin: /webhook → http://localhost:3000/webhook',
      tip: 'Parfait pour recevoir des données de services externes.'
    }
  },
  {
    type: 'condition', label: 'Condition', icon: 'GitBranch', color: '#fb923c', category: 'core',
    inputs: 1, outputs: 2,
    configFields: [
      { key: 'field', label: 'Champ', type: 'text', default: 'data.value' },
      { key: 'operator', label: 'Opérateur', type: 'select', options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains'], default: '==' },
      { key: 'value', label: 'Valeur', type: 'text', default: '' }
    ],
    help: {
      description: 'Dirige le flux selon une condition. Sortie 1 = Vrai, Sortie 2 = Faux.',
      example: 'Champ: data.temperature, Opérateur: >, Valeur: 30',
      tip: 'Les deux branches peuvent être connectées à des nœuds différents.'
    }
  },
  {
    type: 'transformJson', label: 'Transformer JSON', icon: 'RefreshCw', color: '#2dd4bf', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'expression', label: 'Expression de transformation', type: 'textarea', default: '// Accédez aux données via "input"\nreturn input;' }
    ],
    help: {
      description: 'Transforme les données JSON avec une expression JavaScript.',
      example: 'return { name: input.first + " " + input.last, age: input.age };',
      tip: 'La variable "input" contient les données du nœud précédent.'
    }
  },
  {
    type: 'email', label: 'Email SMTP', icon: 'Mail', color: '#f472b6', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'to', label: 'Destinataire', type: 'text', default: '' },
      { key: 'subject', label: 'Sujet', type: 'text', default: '' },
      { key: 'body', label: 'Corps du message', type: 'textarea', default: '' },
      { key: 'smtp_host', label: 'Serveur SMTP', type: 'text', default: 'smtp.gmail.com' },
      { key: 'smtp_port', label: 'Port SMTP', type: 'number', default: 587 }
    ],
    help: {
      description: 'Envoie un email via un serveur SMTP.',
      example: 'Destinataire: user@email.com\nSujet: Alerte Workflow',
      tip: "Pour Gmail, activez \"Mots de passe d'application\" dans les paramètres de sécurité."
    }
  },
  {
    type: 'readFile', label: 'Lecture Fichier', icon: 'FolderOpen', color: '#a78bfa', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'path', label: 'Chemin du fichier', type: 'text', default: '' },
      { key: 'format', label: 'Format', type: 'select', options: ['text', 'json', 'csv'], default: 'text' }
    ],
    help: {
      description: 'Lit un fichier depuis le disque local.',
      example: 'Chemin: C:\\data\\input.csv\nFormat: csv',
      tip: 'Le format CSV sera automatiquement converti en tableau JSON.'
    }
  },
  {
    type: 'writeFile', label: 'Écriture Fichier', icon: 'Save', color: '#34d399', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'path', label: 'Chemin du fichier', type: 'text', default: '' },
      { key: 'format', label: 'Format', type: 'select', options: ['text', 'json', 'csv'], default: 'json' }
    ],
    help: {
      description: 'Écrit des données dans un fichier sur le disque.',
      example: 'Chemin: C:\\data\\output.json\nFormat: json',
      tip: 'Les dossiers parents sont créés automatiquement si nécessaire.'
    }
  },
  {
    type: 'codeJs', label: 'Code JavaScript', icon: 'Code', color: '#fcd34d', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'code', label: 'Code JavaScript', type: 'code', default: '// Les données d\'entrée sont dans la variable "input"\n// Retournez le résultat\nreturn input;' }
    ],
    help: {
      description: 'Exécute du code JavaScript personnalisé.',
      example: 'const filtered = input.items.filter(i => i.active);\nreturn { items: filtered, count: filtered.length };',
      tip: 'Vous avez accès à toutes les fonctions JavaScript standard.'
    }
  },
  {
    type: 'delay', label: 'Délai', icon: 'Hourglass', color: '#94a3b8', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'seconds', label: 'Durée (secondes)', type: 'number', default: 5 }
    ],
    help: {
      description: 'Met le workflow en pause pendant un temps défini.',
      example: 'Durée: 10 → pause de 10 secondes',
      tip: 'Utile pour respecter les limites de taux des API.'
    }
  },
  {
    type: 'notification', label: 'Notification', icon: 'Bell', color: '#f87171', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'title', label: 'Titre', type: 'text', default: 'FlowForge' },
      { key: 'body', label: 'Message', type: 'text', default: '' }
    ],
    help: {
      description: 'Affiche une notification système Windows.',
      example: 'Titre: Alerte\nMessage: Le workflow est terminé !',
      tip: 'Les notifications apparaissent dans le centre de notifications Windows.'
    }
  },
  // ──── Data & APIs ────
  {
    type: 'rssParser', label: 'Lecture RSS', icon: 'Rss', color: '#f97316', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'rssUrl', label: 'URL du Flux RSS', type: 'text', default: 'https://news.ycombinator.com/rss' }
    ],
    help: {
      description: 'Récupère et parse un flux RSS ou Atom en format JSON exploitable.',
      example: 'URL: https://lemonde.fr/rss/une.xml',
      tip: 'La sortie contient une liste "items" avec chaque article du flux.'
    }
  },
  {
    type: 'dataFilter', label: 'Filtre de Données', icon: 'Filter', color: '#14b8a6', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'property', label: 'Propriété (ex: price, user.age)', type: 'text', default: '' },
      { key: 'operator', label: 'Opérateur', type: 'select', options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains'], default: '==' },
      { key: 'value', label: 'Valeur', type: 'text', default: '' }
    ],
    help: {
      description: 'Filtre une liste d\'éléments (tableau JSON) selon une condition.',
      example: 'Propriété: price, Opérateur: >, Valeur: 100',
      tip: 'Idéal pour filtrer les résultats d\'un flux RSS ou d\'une API.'
    }
  },
  {
    type: 'cryptoPrice', label: 'Prix Crypto', icon: 'Bitcoin', color: '#f59e0b', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'coin', label: 'ID Cryptomonnaie', type: 'text', default: 'bitcoin' },
      { key: 'currency', label: 'Devise', type: 'text', default: 'usd' }
    ],
    help: {
      description: 'Récupère le prix en temps réel d\'une cryptomonnaie via CoinGecko.',
      example: 'ID: ethereum, Devise: eur',
      tip: 'Utilisez les identifiants complets en anglais (ex: bitcoin, litecoin).'
    }
  },
  {
    type: 'githubRepoInfo', label: 'GitHub Repo Info', icon: 'Github', color: '#18181b', category: 'api',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'owner', label: 'Propriétaire', type: 'text', default: 'electron' },
      { key: 'repo', label: 'Dépôt', type: 'text', default: 'electron' }
    ],
    help: {
      description: 'Récupère les informations d\'un dépôt GitHub (stars, forks, description).',
      example: 'Propriétaire: facebook\nDépôt: react',
      tip: 'La sortie contient le nombre d\'étoiles, le langage principal et l\'URL.'
    }
  },
  {
    type: 'openFda', label: 'OpenFDA (Santé)', icon: 'Heart', color: '#ec4899', category: 'sante',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'query', label: 'Recherche (médicament, effet...)', type: 'text', default: 'aspirin' },
      { key: 'endpoint', label: 'Type de donnée', type: 'select', options: ['drug/event', 'drug/label', 'food/enforcement'], default: 'drug/event' }
    ],
    help: {
      description: 'Recherche des données de santé via l\'API publique OpenFDA.',
      example: 'Recherche: paracetamol',
      tip: 'Utile pour faire de la veille sanitaire ou récupérer des informations médicales.'
    }
  },
  {
    type: 'stockPrice', label: 'Bourse (Finance)', icon: 'LineChart', color: '#10b981', category: 'finance',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'symbol', label: 'Symbole (ex: AAPL, MSFT)', type: 'text', default: 'AAPL' }
    ],
    help: {
      description: 'Récupère le cours actuel d\'une action en bourse.',
      example: 'Symbole: TSLA',
      tip: 'La sortie contient le prix exact de l\'action demandée.'
    }
  },
  // ──── Integrations ────
  {
    type: 'discordWebhook', label: 'Envoi Discord', icon: 'MessageSquare', color: '#5865F2', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'webhookUrl', label: 'URL du Webhook', type: 'password', default: '' },
      { key: 'content', label: 'Message', type: 'textarea', default: 'Nouveau message de FlowForge !' },
      { key: 'username', label: 'Nom du Bot', type: 'text', default: 'FlowForge Bot' }
    ],
    help: {
      description: 'Envoie un message sur un salon Discord via un Webhook.',
      example: 'Message: Alerte: Le serveur est down !',
      tip: 'Créez un webhook dans les paramètres d\'intégration de votre salon Discord.'
    }
  },
  {
    type: 'slackWebhook', label: 'Envoi Slack', icon: 'Hash', color: '#E01E5A', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'webhookUrl', label: 'URL du Webhook', type: 'password', default: '' },
      { key: 'text', label: 'Message', type: 'textarea', default: 'Nouveau message de FlowForge !' }
    ],
    help: {
      description: 'Envoie un message sur un canal Slack via un Webhook entrant.',
      example: 'Message: Une nouvelle commande a été passée !',
      tip: 'Générez une URL de webhook depuis l\'interface d\'administration de Slack.'
    }
  },
  {
    type: 'googleCalendar', label: 'Google Calendar', icon: 'Calendar', color: '#4285F4', category: 'planning',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'summary', label: 'Titre de l\'événement', type: 'text', default: 'Réunion importante' },
      { key: 'date', label: 'Date et Heure (ISO)', type: 'text', default: '' }
    ],
    help: {
      description: 'Ajoute un événement directement dans votre Google Calendar.',
      example: 'Titre: Point d\'équipe',
      tip: 'Si vous laissez la date vide, l\'heure actuelle sera utilisée.'
    }
  },
  {
    type: 'notionDatabase', label: 'Notion Database', icon: 'Database', color: '#000000', category: 'productivite',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'databaseId', label: 'Database ID', type: 'password', default: '' },
      { key: 'title', label: 'Titre de la page', type: 'text', default: '' }
    ],
    help: {
      description: 'Crée une nouvelle page/tâche dans votre base de données Notion.',
      example: 'Titre: Relancer le client X',
      tip: 'Connectez un nœud Trigger Telegram pour créer des tâches Notion depuis votre téléphone !'
    }
  },
  // ──── AI ────
  {
    type: 'aiAgent', label: 'Agent IA', icon: 'Bot', color: '#818cf8', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'provider', label: 'Fournisseur', type: 'select', options: ['openai', 'ollama'], default: 'openai' },
      { key: 'apiKey', label: 'Clé API', type: 'password', default: '', showIf: (c) => c.provider === 'openai' },
      { key: 'model', label: 'Modèle', type: 'text', default: 'gpt-4' },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', default: 'Tu es un assistant utile.' },
      { key: 'userPrompt', label: 'User Prompt', type: 'textarea', default: '' },
      { key: 'temperature', label: 'Température', type: 'number', default: 0.7 }
    ],
    help: {
      description: "Envoie un prompt à un modèle d'IA (OpenAI ou Ollama local).",
      example: 'Provider: openai\nModèle: gpt-4\nPrompt: Résume ce texte...',
      tip: 'Pour Ollama (gratuit, local), installez Ollama et utilisez le modèle llama3.'
    }
  },
  {
    type: 'aiTextAnalyzer', label: 'Analyseur Texte IA', icon: 'Brain', color: '#a78bfa', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'provider', label: 'Fournisseur', type: 'select', options: ['openai', 'ollama'], default: 'openai' },
      { key: 'apiKey', label: 'Clé API', type: 'password', default: '', showIf: (c) => c.provider === 'openai' },
      { key: 'model', label: 'Modèle', type: 'text', default: 'gpt-4' },
      { key: 'analysisType', label: "Type d'analyse", type: 'select', options: ['sentiment', 'summary', 'entities'], default: 'sentiment' }
    ],
    help: {
      description: "Analyse du texte avec l'IA : sentiment, résumé ou extraction d'entités.",
      example: 'Type: sentiment → { sentiment: "positif", score: 0.92, explanation: "..." }',
      tip: 'Le texte à analyser provient automatiquement du nœud précédent.'
    }
  },
  {
    type: 'aiImageGenerator', label: 'Générateur Image IA', icon: 'Image', color: '#c084fc', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'apiKey', label: 'Clé API OpenAI', type: 'password', default: '' },
      { key: 'prompt', label: "Description de l'image", type: 'textarea', default: '' },
      { key: 'size', label: 'Taille', type: 'select', options: ['256x256', '512x512', '1024x1024'], default: '512x512' }
    ],
    help: {
      description: "Génère une image à partir d'une description textuelle via DALL-E.",
      example: 'Prompt: Un chat astronaute sur la lune, style aquarelle',
      tip: 'Soyez descriptif et précis pour de meilleurs résultats.'
    }
  },
  {
    type: 'aiClassifier', label: 'Classificateur IA', icon: 'Tags', color: '#e879f9', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'provider', label: 'Fournisseur', type: 'select', options: ['openai', 'ollama'], default: 'openai' },
      { key: 'apiKey', label: 'Clé API', type: 'password', default: '', showIf: (c) => c.provider === 'openai' },
      { key: 'model', label: 'Modèle', type: 'text', default: 'gpt-4' },
      { key: 'categories', label: 'Catégories (une par ligne)', type: 'textarea', default: 'positif\nnégatif\nneutre' }
    ],
    help: {
      description: 'Classe automatiquement du texte dans des catégories personnalisées.',
      example: 'Catégories: urgent, normal, faible priorité\n→ { category: "urgent", confidence: 0.95 }',
      tip: 'Définissez des catégories claires et mutuellement exclusives.'
    }
  },
  {
    type: 'translateText', label: 'Traduction IA', icon: 'Languages', color: '#8b5cf6', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'targetLanguage', label: 'Langue cible (ex: en, es, fr)', type: 'text', default: 'en' }
    ],
    help: {
      description: 'Traduit automatiquement le texte reçu dans la langue de votre choix.',
      example: 'Langue cible: es',
      tip: 'Simule une traduction en temps réel via l\'IA locale ou distante.'
    }
  },
  // ──── Map ────
  {
    type: 'mapSearch', label: 'Recherche Carte', icon: 'MapPin', color: '#fb7185', category: 'map',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'query', label: 'Recherche', type: 'text', default: 'boulangerie' },
      { key: 'location', label: 'Ville ou adresse', type: 'text', default: 'Paris' },
      { key: 'radius', label: 'Rayon (km)', type: 'number', default: 5 }
    ],
    help: {
      description: 'Recherche des lieux (boutiques, restaurants...) sur la carte OpenStreetMap.',
      example: 'Recherche: restaurant italien\nVille: Lyon\nRayon: 2km',
      tip: 'Les résultats sont affichés sur une carte interactive dans le panneau de droite.'
    }
  },
  // ──── Telegram ────
  {
    type: 'telegramTrigger', label: 'Trigger Telegram', icon: 'MessageCircle', color: '#0088cc', category: 'telegram',
    inputs: 0, outputs: 1,
    configFields: [
      { key: 'botToken', label: 'Token du Bot', type: 'password', default: '' },
      { key: 'timeout', label: 'Timeout (secondes)', type: 'number', default: 30 }
    ],
    help: {
      description: 'Reçoit les messages envoyés à votre bot Telegram via long polling.',
      example: 'Token: 123456:ABC-DEF (obtenu via @BotFather)',
      tip: 'Créez un bot via @BotFather sur Telegram pour obtenir le token.'
    }
  },
  {
    type: 'telegramSend', label: 'Envoi Telegram', icon: 'Send', color: '#0088cc', category: 'telegram',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'botToken', label: 'Token du Bot', type: 'password', default: '' },
      { key: 'chatId', label: 'Chat ID', type: 'text', default: '' },
      { key: 'message', label: 'Message', type: 'textarea', default: '' },
      { key: 'parseMode', label: 'Format', type: 'select', options: ['HTML', 'Markdown', 'MarkdownV2'], default: 'HTML' }
    ],
    help: {
      description: 'Envoie un message via votre bot Telegram à un chat ou utilisateur.',
      example: 'Chat ID: 123456789\nMessage: Bonjour depuis FlowForge !',
      tip: 'Le Chat ID est dans la réponse du Trigger Telegram. Supporte HTML et Markdown.'
    }
  }
]

/** Icon component map — maps icon string names to lucide-react components */
export const ICON_MAP = {
  Play, Clock, Globe, Anchor, GitBranch, RefreshCw, Mail,
  FolderOpen, Save, Code, Hourglass, Bell, Bot, Brain,
  Image, Tags, MapPin, MessageCircle, Send,
  MessageSquare, Hash, Rss, Filter, Bitcoin,
  Github, Languages, Heart, LineChart, Calendar, Database
}

/** Category labels for sidebar display */
const CATEGORY_LABELS = {
  core: 'Core',
  api: 'Données & APIs',
  ai: 'Intelligence Artificielle',
  map: 'Carte',
  telegram: 'Telegram',
  sante: 'Santé',
  finance: 'Finance',
  planning: 'Planning',
  productivite: 'Productivité'
}

/** Get a single module definition by its type string */
export function getModuleByType(type) {
  return MODULE_DEFINITIONS.find((m) => m.type === type) || null
}

/** Get all modules belonging to a category */
export function getModulesByCategory(category) {
  return MODULE_DEFINITIONS.filter((m) => m.category === category)
}

/** Get the human-readable label for a category key */
export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category
}

/** Get the ordered list of unique category keys */
export function getCategories() {
  const seen = new Set()
  const cats = []
  MODULE_DEFINITIONS.forEach((m) => {
    if (!seen.has(m.category)) {
      seen.add(m.category)
      cats.push(m.category)
    }
  })
  return cats
}
