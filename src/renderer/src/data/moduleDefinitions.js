import {
  Play, Clock, Globe, Anchor, GitBranch, RefreshCw, Mail,
  FolderOpen, Save, Code, Hourglass, Bell, Bot, Brain,
  Image, Tags, MapPin, MessageCircle, Send,
  MessageSquare, Hash, Rss, Filter, Bitcoin,
  Github, Languages, Heart, LineChart, Calendar, Database,
  Terminal, FileText, Search, Table, Binary, FileDigit,
  Calculator, Scissors, Layout, MessageCircleQuestion, Phone, Volume2
} from 'lucide-react'


export const MODULE_DEFINITIONS = [
  // ──── Triggers ────
  {
    type: 'triggerManual', label: 'Déclencheur Manuel', icon: 'Play', color: '#f43f5e', category: 'trigger',
    inputs: 0, outputs: 1,
    configFields: [],
    outputFields: [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'trigger', label: 'Lancer la suite (Action)' }
    ],
    help: {
      description: 'Déclenche le workflow manuellement quand vous cliquez sur Play.',
      example: 'Cliquez sur ▶️ pour lancer le workflow.',
      tip: 'Utilisez ce nœud comme point de départ de tous vos workflows.'
    }
  },
  {
    type: 'timerCron', label: 'Timer / Cron', icon: 'Clock', color: '#f59e0b', category: 'trigger',
    inputs: 0, outputs: 1,
    configFields: [
      { key: 'interval', label: 'Intervalle (ex: 5s, 10m, 1h)', type: 'text', default: '5m' }
    ],
    outputFields: [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'trigger', label: 'Lancer la suite (Action)' }
    ],
    help: {
      description: 'Déclenche le workflow à un intervalle régulier.',
      example: 'Intervalle: 10s (toutes les 10 secondes), 5m (5 minutes)',
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
    outputFields: [{ key: 'data', label: 'Data' }, { key: 'status', label: 'Status' }],
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
    outputFields: [{ key: 'body', label: 'Body' }, { key: 'query', label: 'Query' }],
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
    outputFields: [],
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
    outputFields: [{ key: 'result', label: 'Résultat JSON' }],
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
    outputFields: [{ key: 'success', label: 'Succès' }],
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
    outputFields: [{ key: 'data', label: 'Contenu (data)' }],
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
    outputFields: [{ key: 'success', label: 'Succès' }],
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
    outputFields: [{ key: 'result', label: 'Résultat' }],
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
    outputFields: [{ key: 'success', label: 'Succès' }],
    help: {
      description: 'Met le workflow en pause pendant un temps défini.',
      example: 'Durée: 10 → pause de 10 secondes',
      tip: 'Utile pour respecter les limites de taux des API.'
    }
  },
  {
    type: 'loopForEach', label: 'Boucle (Loop)', icon: 'RefreshCw', color: '#22d3ee', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'arrayField', label: 'Champ tableau (ex: items)', type: 'text', default: 'items' },
      { key: 'maxIterations', label: 'Max itérations (0 = illimité)', type: 'number', default: 0 }
    ],
    outputFields: [{ key: 'item', label: 'Élément (item)' }, { key: 'index', label: 'Index' }],
    help: {
      description: 'Itère sur chaque élément d\'un tableau. Passe les éléments un par un au nœud suivant.',
      example: 'Champ: items → traite chaque élément du tableau',
      tip: 'Connectez la sortie à un nœud de traitement pour appliquer une action à chaque élément.'
    }
  },
  {
    type: 'notification', label: 'Notification', icon: 'Bell', color: '#f87171', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'title', label: 'Titre', type: 'text', default: 'FlowForge' },
      { key: 'body', label: 'Message', type: 'text', default: '' }
    ],
    outputFields: [{ key: 'success', label: 'Succès' }],
    help: {
      description: 'Affiche une notification dans l\'application.',
      example: 'Titre: Alerte\nMessage: Le workflow est terminé !',
      tip: 'Utilisez {{input.xxx}} pour injecter des données dynamiques.'
    }
  },
  {
    type: 'executeCommand', label: 'Commande Shell', icon: 'Terminal', color: '#64748b', category: 'systeme',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'command', label: 'Commande', type: 'text', default: 'echo "Hello"' }
    ],
    outputFields: [{ key: 'stdout', label: 'Sortie Stdout' }, { key: 'stderr', label: 'Erreur Stderr' }],
    help: {
      description: 'Exécute une commande dans le terminal du système.',
      example: 'Commande: dir C:\\',
      tip: 'Utile pour lancer des scripts ou interagir avec l\'OS.'
    }
  },
  {
    type: 'uuidGenerator', label: 'Générer UUID', icon: 'FileDigit', color: '#94a3b8', category: 'systeme',
    inputs: 1, outputs: 1,
    configFields: [],
    outputFields: [{ key: 'uuid', label: 'UUID' }],
    help: {
      description: 'Génère un identifiant unique universel (UUID v4).',
      example: '→ { uuid: "123e4567-e89b-12d3-a456-426614174000" }',
      tip: 'Indispensable pour créer des clés primaires ou des tokens.'
    }
  },
  {
    type: 'base64', label: 'Base64 Encode/Decode', icon: 'Binary', color: '#cbd5e1', category: 'donnees',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'action', label: 'Action', type: 'select', options: ['encode', 'decode'], default: 'encode' },
      { key: 'inputField', label: 'Champ de données (laisser vide pour config.text)', type: 'text', default: '' },
      { key: 'text', label: 'Texte par défaut', type: 'textarea', default: '' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Convertit du texte en Base64 et inversement.',
      example: 'Action: encode, Texte: Hello → SGVsbG8=',
      tip: 'Pratique pour les requêtes HTTP nécessitant une auth Basic.'
    }
  },
  {
    type: 'regexMatch', label: 'Expression Régulière', icon: 'Search', color: '#14b8a6', category: 'donnees',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'pattern', label: 'Pattern Regex', type: 'text', default: '.*' },
      { key: 'inputField', label: 'Champ à analyser', type: 'text', default: 'text' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Extrait des données à partir d\'un texte selon un pattern.',
      example: 'Pattern: \\d+ → Extrait tous les nombres',
      tip: 'La sortie contiendra un tableau des correspondances (matches).'
    }
  },
  {
    type: 'jsonToCsv', label: 'JSON vers CSV', icon: 'Table', color: '#0ea5e9', category: 'donnees',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'inputField', label: 'Champ JSON (vide = tout)', type: 'text', default: '' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Convertit un tableau d\'objets JSON en texte CSV.',
      example: '[{a: 1}] → "a\\n1"',
      tip: 'Associez-le au nœud Écriture Fichier pour générer un fichier .csv.'
    }
  },
  {
    type: 'csvToJson', label: 'CSV vers JSON', icon: 'FileText', color: '#0284c7', category: 'donnees',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'csv', label: 'Contenu CSV (vide = prendre de l\'input)', type: 'textarea', default: '' },
      { key: 'inputField', label: 'Champ contenant le CSV', type: 'text', default: 'content' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Convertit un texte CSV en tableau d\'objets JSON.',
      example: '"a,b\\n1,2" → [{a:"1", b:"2"}]',
      tip: 'Peut traiter la sortie d\'un fichier texte lu avec Lecture Fichier.'
    }
  },
  {
    type: 'mathOperation', label: 'Calcul Mathématique', icon: 'Calculator', color: '#ef4444', category: 'donnees',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'operation', label: 'Opération', type: 'select', options: ['add', 'subtract', 'multiply', 'divide'], default: 'add' },
      { key: 'a', label: 'Valeur A (nombre ou champ)', type: 'text', default: '0' },
      { key: 'b', label: 'Valeur B (nombre ou champ)', type: 'text', default: '0' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Effectue une opération mathématique de base.',
      example: 'Opération: add, A: 5, B: 10 → 15',
      tip: 'Vous pouvez référencer des champs d\'input ex: {{input.price}}.'
    }
  },
  {
    type: 'stringManipulation', label: 'Manipulation Texte', icon: 'Scissors', color: '#f59e0b', category: 'donnees',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'action', label: 'Action', type: 'select', options: ['uppercase', 'lowercase', 'trim', 'split'], default: 'uppercase' },
      { key: 'text', label: 'Texte à modifier', type: 'text', default: '' },
      { key: 'separator', label: 'Séparateur (pour split)', type: 'text', default: ',', showIf: (c) => c.action === 'split' }
    ],
    outputFields: [
      { key: 'result', label: 'Résultat' },
      { key: 'text', label: 'Texte (Identique au résultat)' }
    ],
    help: {
      description: 'Modifie une chaîne de caractères.',
      example: 'Action: uppercase, Texte: hello → HELLO',
      tip: 'L\'action split retournera un tableau (array) de sous-chaînes.'
    }
  },
  // ──── Data & APIs ────
  {
    type: 'webScraper', label: 'Scraper Web', icon: 'Globe', color: '#10b981', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'url', label: 'URL à Scraper', type: 'text', default: 'https://fr.wikipedia.org' }
    ],
    outputFields: [{ key: 'content', label: 'Texte Extrait' }, { key: 'title', label: 'Titre' }],
    help: {
      description: 'Extrait le texte propre d\'une page web (sans menus, pubs, etc.).',
      example: 'URL: https://fr.wikipedia.org/wiki/OpenAI',
      tip: 'Idéal pour alimenter un Agent IA avec le contenu d\'un article web.'
    }
  },
  {
    type: 'youtubeTranscript', label: 'YouTube Transcript', icon: 'Play', color: '#ef4444', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'url', label: 'URL YouTube', type: 'text', default: '' }
    ],
    outputFields: [{ key: 'transcript', label: 'Sous-titres' }],
    help: {
      description: 'Récupère les sous-titres complets d\'une vidéo YouTube.',
      example: 'URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      tip: 'Utile pour résumer une longue vidéo ou en extraire les idées clés avec l\'IA.'
    }
  },
  {
    type: 'pdfParser', label: 'Extracteur PDF', icon: 'FileText', color: '#ec4899', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'filePath', label: 'Chemin local ou URL HTTP', type: 'text', default: '' }
    ],
    outputFields: [{ key: 'text', label: 'Texte du PDF' }, { key: 'pages', label: 'Nombre de pages' }],
    help: {
      description: 'Lit un fichier PDF pour en extraire le texte brut.',
      example: 'Chemin: C:\\Users\\MonFichier.pdf ou https://site.com/doc.pdf',
      tip: 'Attention : extraire un PDF très long (plus de 100 pages) peut prendre beaucoup de tokens pour l\'IA.'
    }
  },
  {
    type: 'rssParser', label: 'Lecture RSS', icon: 'Rss', color: '#f97316', category: 'core',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'rssUrl', label: 'URL du Flux RSS', type: 'text', default: 'https://news.ycombinator.com/rss' }
    ],
    outputFields: [{ key: 'items', label: 'Articles (items)' }],
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
    outputFields: [{ key: 'result', label: 'Résultat filtré' }],
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
    outputFields: [{ key: 'price', label: 'Prix' }, { key: 'currency', label: 'Devise' }],
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
    outputFields: [{ key: 'stars', label: 'Étoiles' }, { key: 'forks', label: 'Forks' }, { key: 'issues', label: 'Issues' }],
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
    outputFields: [{ key: 'result', label: 'Résultat' }],
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
    outputFields: [{ key: 'price', label: 'Prix' }, { key: 'symbol', label: 'Symbole' }],
    help: {
      description: 'Récupère le cours actuel d\'une action en bourse.',
      example: 'Symbole: TSLA',
      tip: 'La sortie contient le prix exact de l\'action demandée.'
    }
  },
  {
    type: 'trelloCard', label: 'Créer Carte Trello', icon: 'Layout', color: '#0079bf', category: 'productivite',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', default: '' },
      { key: 'token', label: 'Token', type: 'password', default: '' },
      { key: 'idList', label: 'ID de la Liste', type: 'text', default: '' },
      { key: 'name', label: 'Nom de la carte', type: 'text', default: 'Nouvelle tâche' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Crée une carte dans une liste Trello via l\'API officielle.',
      example: 'Nom de la carte: Bugfix 1.0.2',
      tip: 'Vous trouverez la clé et le token dans la section Power-Ups de Trello.'
    }
  },
  {
    type: 'githubCreateIssue', label: 'Créer Issue GitHub', icon: 'Github', color: '#18181b', category: 'api',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'token', label: 'Token GitHub', type: 'password', default: '' },
      { key: 'repo', label: 'Dépôt (owner/repo)', type: 'text', default: 'Tchoupiiii/FlowForge' },
      { key: 'title', label: 'Titre de l\'issue', type: 'text', default: 'Bug report' },
      { key: 'body', label: 'Description', type: 'textarea', default: '' }
    ],
    outputFields: [{ key: 'url', label: 'URL de l\'issue' }, { key: 'number', label: 'Numéro' }],
    help: {
      description: 'Crée une issue sur un dépôt GitHub.',
      example: 'Titre: Erreur sur le panneau\nDescription: ...',
      tip: 'Nécessite un Personal Access Token avec la permission "repo".'
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
    outputFields: [{ key: 'success', label: 'Succès' }],
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
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Envoie un message sur un canal Slack via un Webhook entrant.',
      example: 'Message: Une nouvelle commande a été passée !',
      tip: 'Générez une URL de webhook depuis l\'interface d\'administration de Slack.'
    }
  },
  {
    type: 'googleCalendarGet', label: 'Request Google Calendar', icon: 'Calendar', color: '#4285F4', category: 'planning',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'filter', label: 'Recherche / Filtre', type: 'text', default: '' }
    ],
    outputFields: [
      { key: 'events', label: 'Événements (Array)' },
      { key: 'result', label: 'Résultat' }
    ],
    help: {
      description: 'Récupère la liste des événements enregistrés dans Google Calendar (simulé).',
      example: 'Filtre: Présentation',
      tip: 'Retourne un tableau d\'événements et un résumé texte.'
    }
  },
  {
    type: 'googleCalendar', label: 'Write Google Calendar', icon: 'Calendar', color: '#4285F4', category: 'planning',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'summary', label: 'Titre de l\'événement', type: 'text', default: 'Réunion importante' },
      { key: 'date', label: 'Date et Heure (ISO)', type: 'text', default: '' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Ajoute un événement directement dans votre Google Calendar (simulé).',
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
    outputFields: [{ key: 'result', label: 'Résultat' }],
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
    outputFields: [{ key: 'response', label: 'Réponse Agent' }],
    help: {
      description: "Envoie un prompt à un modèle d'IA (OpenAI ou Ollama local).",
      example: 'Provider: openai\nModèle: gpt-4\nPrompt: Résume ce texte...',
      tip: 'Pour Ollama (gratuit, local), installez Ollama et utilisez le modèle llama3.'
    }
  },
  {
    type: 'openAiChat', label: 'ChatGPT', icon: 'MessageCircleQuestion', color: '#10a37f', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'apiKey', label: 'Clé API', type: 'password', default: '' },
      { key: 'model', label: 'Modèle', type: 'text', default: 'gpt-4o' },
      { key: 'prompt', label: 'Prompt', type: 'textarea', default: 'Bonjour' }
    ],
    outputFields: [{ key: 'message', label: 'Message IA' }],
    help: {
      description: 'Envoie une requête directement à l\'API cloud OpenAI.',
      example: 'Prompt: Donne-moi une blague.',
      tip: 'Si vous avez configuré Ollama, préférez le module Agent IA.'
    }
  },
  {
    type: 'anthropicClaude', label: 'Claude (Anthropic)', icon: 'Bot', color: '#d97757', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'apiKey', label: 'Clé API', type: 'password', default: '' },
      { key: 'model', label: 'Modèle', type: 'text', default: 'claude-3-opus-20240229' },
      { key: 'prompt', label: 'Prompt', type: 'textarea', default: 'Bonjour' }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Envoie une requête à l\'API Anthropic Claude.',
      example: 'Prompt: Explique la physique quantique.',
      tip: 'Claude est excellent pour l\'analyse de très grands textes.'
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
    outputFields: [{ key: 'summary', label: 'Résumé' }, { key: 'keywords', label: 'Mots-clés' }],
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
    outputFields: [{ key: 'url', label: 'URL Image' }],
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
    outputFields: [{ key: 'category', label: 'Catégorie' }, { key: 'confidence', label: 'Confiance' }],
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
    outputFields: [{ key: 'result', label: 'Résultat' }],
    help: {
      description: 'Traduit automatiquement le texte reçu dans la langue de votre choix.',
      example: 'Langue cible: es',
      tip: 'Simule une traduction en temps réel via l\'IA locale ou distante.'
    }
  },
  {
    type: 'phoneAgent', label: 'Agent Téléphonique', icon: 'Phone', color: '#10b981', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'source', label: 'Source de données', type: 'select', options: ['Calendar', 'PDF', 'XLS', 'None'], default: 'None' },
      { key: 'provider', label: 'Fournisseur', type: 'select', options: ['openai', 'ollama'], default: 'openai' },
      { key: 'model', label: 'Modèle', type: 'text', default: 'gpt-4o' },
      { key: 'voice', label: 'Voix', type: 'select', options: ['Alloy', 'Echo', 'Fable', 'Onyx', 'Nova', 'Shimmer'], default: 'Alloy' },
      { key: 'systemPrompt', label: 'Prompt Système', type: 'textarea', default: 'Tu es un assistant vocal téléphonique poli et concis.' },
      { key: 'userPrompt', label: 'Prompt Utilisateur (Transcription)', type: 'textarea', default: 'Bonjour, je voudrais prendre un rendez-vous mardi s\'il vous plaît.' },
      { key: 'logPath', label: 'Chemin du fichier de Log', type: 'text', default: 'C:\\Users\\Arthur\\Desktop\\appel_log.txt' }
    ],
    outputFields: [
      { key: 'response', label: 'Réponse Vocale' },
      { key: 'latencyMs', label: 'Latence (ms)' },
      { key: 'appointmentBooked', label: 'Rendez-vous créé' },
      { key: 'appointmentDate', label: 'Date du rendez-vous' },
      { key: 'transcript', label: 'Transcription de l\'appel' }
    ],
    help: {
      description: 'Simule un agent vocal intelligent répondant au téléphone en moins de 500ms.',
      example: 'Prompt Utilisateur: Je souhaite prendre rendez-vous pour demain.',
      tip: 'Si la source est Calendar et qu\'un rendez-vous est demandé, l\'agent insère automatiquement l\'événement.'
    }
  },
  {
    type: 'tts', label: 'Synthèse Vocale (TTS)', icon: 'Volume2', color: '#a78bfa', category: 'ai',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'text', label: 'Texte à synthétiser', type: 'textarea', default: 'Bonjour et bienvenue chez FlowForge !' },
      { key: 'language', label: 'Langue', type: 'select', options: ['fr', 'en', 'es', 'de', 'it'], default: 'fr' }
    ],
    outputFields: [
      { key: 'audioUrl', label: 'URL Audio' },
      { key: 'result', label: 'Résultat (URL Audio)' }
    ],
    help: {
      description: 'Génère un fichier audio parlé à partir d\'un texte.',
      example: 'Texte: Votre rendez-vous est confirmé pour demain.',
      tip: 'Générez une URL audio Google Translate TTS prête à être lue.'
    }
  },
  // ──── Map ────
  {
    type: 'mapSearch', label: 'Recherche Carte', icon: 'MapPin', color: '#fb7185', category: 'map',
    inputs: 1, outputs: 1,
    configFields: [
      { key: 'query', label: 'Recherche', type: 'text', default: 'boulangerie' },
      { key: 'location', label: 'Ville ou adresse', type: 'text', default: 'Paris' },
      { key: 'radius', label: 'Rayon (km)', type: 'number', default: 5 },
      { key: 'limit', label: 'Limite de résultats (0 = max)', type: 'number', default: 10 }
    ],
    outputFields: [{ key: 'result', label: 'Résultat' }],
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
    outputFields: [
      { key: 'messages', label: 'Messages (Brut)' },
      { key: 'text', label: 'Texte' },
      { key: 'chatid', label: 'Chat ID' }
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
    outputFields: [{ key: 'success', label: 'Succès' }],
    help: {
      description: 'Envoie un message via votre bot Telegram à un chat ou utilisateur.',
      example: 'Chat ID: 123456789\nMessage: Bonjour depuis FlowForge !',
      tip: 'Le Chat ID est dans la réponse du Trigger Telegram. Supporte HTML et Markdown.'
    }
  }
]

export const ICON_MAP = {
  Play, Clock, Globe, Anchor, GitBranch, RefreshCw, Mail,
  FolderOpen, Save, Code, Hourglass, Bell, Bot, Brain,
  Image, Tags, MapPin, MessageCircle, Send,
  MessageSquare, Hash, Rss, Filter, Bitcoin,
  Github, Languages, Heart, LineChart, Calendar, Database,
  Terminal, FileText, Search, Table, Binary, FileDigit,
  Calculator, Scissors, Layout, MessageCircleQuestion, Phone, Volume2
}


/** Category labels for sidebar display */
const CATEGORY_LABELS = {
  core: 'Core',
  systeme: 'Système & Fichiers',
  donnees: 'Traitement Données',
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
