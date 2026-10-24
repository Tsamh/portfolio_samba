/* Textes français de l'interface : mêmes clés que en.js. */
export default {
  lang: {
    toggle: 'Changer de langue',
    switchTo: 'Switch to English',
  },

  theme: {
    toggle: 'Changer de thème',
    toDark: 'Passer en mode sombre',
    toLight: 'Passer en mode clair',
  },

  navbar: {
    home: "Retour à l'accueil",
    menu: 'Ouvrir ou fermer le menu',
  },

  nav: {
    home: { label: 'Accueil' },
    projects: { label: 'Projets', extra: ' & Certificats' },
    experience: { label: 'Expérience' },
    random: { label: 'En vrac' },
    contact: { label: 'Contact' },
  },

  home: {
    roles: ['Data & IA', 'Logiciel'],
    // "Ingénieur <typed role>"
    title: { before: 'Ingénieur', after: '' },
    subtitle: 'Pipelines, plateformes et modèles, de bout en bout',
    seeCv: 'Voir le CV',
    chibi: 'Samba en chibi',
    hello: 'Bonjour.',
    about: [
      "Je suis un ingénieur qui couvre toute la chaîne de l'intelligence : je conçois et entraîne des modèles, je construis les pipelines de données qui les nourrissent, j'automatise l'infrastructure sur laquelle ils tournent et je livre les applications web qui permettent de s'en servir.",
      'Basé à Dakar, je travaille avec le monde entier. Disponible en freelance, en CDI et pour des collaborations qui repoussent ce que les machines savent faire.',
    ],
  },

  skills: {
    title: 'Compétences',
    byCategory: 'Par catégorie',
    viewAll: 'Tout voir',
    categories: 'Catégories de compétences',
  },

  cv: {
    label: 'Aperçu du CV',
    kinds: { resume: 'ATS - EN', cv: 'Graphique - FR' },
    switchTo: 'Passer à la version {kind}',
    download: 'Télécharger',
    close: "Fermer l'aperçu",
    loading: "Chargement de l'aperçu…",
    error: "L'aperçu n'a pas pu s'afficher. Vous pouvez quand même télécharger le document ci-dessus.",
  },

  projects: {
    title: { before: 'Projets', word: 'phares' },
    sub: {
      click: 'Cliquez sur un domaine',
      wide: 'à droite',
      narrow: 'juste en dessous',
      then: ', puis sur un projet pour les détails.',
    },
    domains: 'Domaines',
    more: 'Cliquez pour les détails',
    open: 'Voir les détails',
  },

  project: {
    close: 'Fermer',
    github: 'GitHub',
    live: 'Site en ligne',
    see: 'Voir',
  },

  certs: {
    title: 'Certificats & attestations',
    sub: "Badges de formation et traces écrites : ce sur quoi j'ai été formé, ce que j'ai animé ou ce à quoi j'ai participé.",
    onCredly: '{title} sur Credly',
    openCredly: 'Ouvrir sur Credly',
    attestations: 'Attestations',
    close: 'Fermer',
  },

  experience: {
    title: 'Expérience',
    subtitle: 'Engagement, événements & partage',
  },

  random: {
    title: 'En vrac',
    subtitle: 'Des choses en vrac sur moi',
  },

  gesture: {
    start: 'Naviguer avec la main',
    stop: 'Arrêter la navigation à la main',
    title: 'Naviguez avec votre main',
    subtitle: 'Placez-vous face à votre webcam et pilotez tout le site sans rien toucher.',
    items: [
      { title: 'Montrez la main', text: 'Montrez votre paume pour déplacer le curseur sur la page' },
      { title: 'Pincement rapide', text: "Pincez le pouce et l'index pour cliquer sur les éléments" },
      { title: 'Pincer & glisser', text: 'Pincez et glissez vers le haut ou le bas pour faire défiler' },
    ],
    privacy: {
      title: "Pas d'espionnage, promis.",
      text: "La vidéo ne quitte jamais votre navigateur : aucun envoi, aucun enregistrement, aucun serveur, aucun dossier secret avec votre visage. Tout tourne en local, et la caméra s'éteint dès que vous quittez.",
      punch: 'Je suis développeur, pas la NSA.',
    },
    errors: {
      blocked: "L'accès à la caméra a été bloqué. Autorisez-le pour ce site dans les réglages du navigateur (l'icône à gauche de la barre d'adresse), puis réessayez.",
      missing: 'Aucune caméra trouvée. Branchez-en une et réessayez.',
      busy: 'La caméra est déjà utilisée par une autre application. Fermez-la et réessayez.',
      insecure: "L'accès à la caméra demande une connexion sécurisée. Ouvrez ce site en https, ou sur localhost.",
      failed: "Le suivi de la main n'a pas pu démarrer. Rechargez la page et réessayez.",
    },
    cancel: 'Annuler',
    enable: 'Activer la caméra',
    loading: 'Chargement du modèle…',
    preview: {
      show: 'Afficher la caméra',
      hide: 'Masquer',
      showLabel: "Afficher l'aperçu de la caméra",
      hideLabel: "Masquer l'aperçu de la caméra",
    },
  },

  scrollHint: {
    text: 'ça défile',
    prev: 'Aller à la page précédente',
    next: 'Aller à la page suivante',
  },

  outro: {
    bye: 'Au revoir !',
    thanks: 'Merci de votre visite.',
    home: 'Retour au début',
  },

  lost: {
    label: 'Page introuvable',
    title: 'Vous avez trouvé la page perdue',
    text: "Rien ne vit ici, alors faites tomber le 404. Déplacez-vous avec la souris ou les flèches du clavier.",
    back: 'Retour au site',
    left: 'Encore {n} briques',
    launch: 'Cliquez ou appuyez sur espace pour lancer',
    missed: 'Raté. Cliquez pour relancer',
    lost: 'Le 404 tient bon. Cliquez pour réessayer',
    won: 'Plus rien à trouver. Cliquez pour le reconstruire',
  },

  avatar: {
    note: [
      'Tu fouilles dans mes poches ?!',
      'Bon... voici mon secret :',
      'je cherche encore sur Google « comment centrer une div »',
      'à chaque fois.',
    ],
    alt: 'Avatar de Samba',
    putAway: 'Ranger le papier',
    pocket: 'Poche de la veste',
  },

  loader: 'Chargement',

  terminal: {
    available: 'Commandes disponibles :',
    cmds: {
      ls: 'lister toutes les pages',
      cd: 'aller à une page (ex : cd projects)',
      about: 'afficher la bio et la présentation',
      skills: 'lister les compétences techniques',
      projects: 'lister les projets (--data, --software, --ai)',
      contact: 'afficher les contacts',
      resume: 'ouvrir le CV',
      whoami: 'qui êtes-vous ?',
      eggs: 'easter eggs trouvés jusqu’ici',
      eggsReset: 'tous les oublier, pour chasser à nouveau',
      theme: 'light | dark | toggle',
      lang: 'en | fr | toggle',
      help: 'afficher cette liste',
      clear: "effacer l'écran",
      exit: 'fermer le terminal',
    },
    navigating: '→ direction /{page}',
    noPage: "cd : page introuvable : {page}, essayez 'ls'",
    empty: '(vide)',
    about: [
      'Samba Hama Traore, data engineer et développeur fullstack.',
      'En dernière année de licence Big Data / IA au Dakar Institute of',
      'Technology, spécialisé en ingénierie des données : ingestion,',
      'transformation, modélisation et orchestration de pipelines.',
      'Chaque projet est construit de bout en bout, documenté et versionné.',
    ],
    aboutHint: "tapez 'projects' pour voir à quoi ça ressemble.",
    skills: 'Compétences techniques :',
    unknownDomain: "projects : domaine inconnu '{arg}' (--data, --software, --ai)",
    resume: '→ ouverture du CV dans un nouvel onglet',
    themeSet: 'thème : {mode}',
    themeUnknown: "theme : mode inconnu '{arg}' (light | dark | toggle)",
    langSet: 'langue : français',
    langUnknown: "lang : langue inconnue '{arg}' (en | fr | toggle)",
    whoami: [
      'samba · IA · Data · MLOps · DevOps · ingénieur fullstack',
      "Basé à Dakar, je construis toute la chaîne de l'intelligence.",
    ],
    lost: '→ ouverture de la page perdue',
    eggsReset: 'easter eggs oubliés : bonne chasse, encore',
    eggsFound: 'easter eggs trouvés : {n}/{total}',
    keepLooking: 'continuez à chercher',
    notFound: "commande introuvable : {name}, tapez 'help'",
    fab: {
      open: 'Mode terminal',
      restore: 'Rouvrir le terminal',
      minimize: 'Réduire le terminal',
    },
    ctrl: {
      close: 'Fermer',
      minimize: 'Réduire',
      maximize: 'Agrandir',
      restore: 'Restaurer',
    },
  },

  eggs: {
    found: 'Easter egg trouvé',
    counter: 'Easter eggs',
    names: {
      pocket: 'Le papier dans sa poche',
      avatar: "L'avatar derrière le site",
      lost: 'La page perdue',
    },
  },

  quoteMarks: { open: '« ', close: ' »' },
  quotes: [
    { text: "N'importe quel idiot peut écrire du code qu'un ordinateur comprend. Les bons programmeurs écrivent du code que les humains comprennent.", author: 'Martin Fowler' },
    { text: "D'abord, résolvez le problème. Ensuite, écrivez le code.", author: 'John Johnson' },
    { text: "L'expérience est le nom que chacun donne à ses erreurs.", author: 'Oscar Wilde' },
    { text: 'Pour être irremplaçable, il faut toujours être différente.', author: 'Coco Chanel' },
    { text: 'Java est à JavaScript ce que le chat est au château.', author: 'Chris Heilmann' },
    { text: 'Savoir, c’est pouvoir.', author: 'Francis Bacon' },
    { text: 'Parfois, mieux vaut rester au lit le lundi que de passer le reste de la semaine à déboguer le code du lundi.', author: 'Dan Salomon' },
    { text: "La simplicité est l'âme de l'efficacité.", author: 'Austin Freeman' },
    { text: "Avant d'être réutilisable, un logiciel doit d'abord être utilisable.", author: 'Ralph Johnson' },
    { text: 'Faites que ça marche, puis que ce soit juste, puis que ce soit rapide.', author: 'Kent Beck' },
    { text: "Le meilleur message d'erreur est celui qui ne s'affiche jamais.", author: 'Thomas Fuchs' },
    { text: "Le code, c'est comme l'humour : quand il faut l'expliquer, c'est raté.", author: 'Cory House' },
    { text: 'Corrigez la cause, pas le symptôme.', author: 'Steve Maguire' },
    { text: "L'optimisme est un risque du métier de programmeur ; les retours en sont le remède.", author: 'Kent Beck' },
    { text: "Quand faut-il développer par itérations ? Presque toujours.", author: 'Martin Fowler' },
  ],

  activity: {
    photo: '{title}, photo {n}',
    more: 'Cliquez pour en voir plus',
    prev: 'Photo précédente',
    next: 'Photo suivante',
    close: 'Fermer',
  },

  contact: {
    title: { before: 'Rendons votre projet', word: 'intelligent', after: ' !' },
    lead: "Systèmes d'IA, plateformes data, infrastructure cloud ou applications fullstack : que vous ayez un cahier des charges précis ou juste une idée, ma boîte mail est ouverte.",
    findMe: 'Retrouvez-moi sur',
    now: 'En ce moment à Dakar',
    meta: [
      { label: 'Localisation',   value: 'Dakar, Sénégal' },
      { label: 'Fuseau horaire', value: 'GMT (UTC+0)' },
      { label: 'Réponse',        value: '< 24 heures' },
      { label: 'Langues',        value: 'FR / EN' },
    ],
    note: "Basé à Dakar, je travaille avec le monde entier. Ouvert au télétravail, au présentiel et à l'hybride.",
    write: 'Ou écrivez-le ici',
    // the sentence reads "j'aimerais vous parler" + topic
    topics: ["d'un système d'IA", "d'une plateforme data", "d'infrastructure cloud", "d'une app fullstack", "simplement d'une idée"],
    form: {
      hi: "Bonjour Samba, je m'appelle",
      name: 'votre nom',
      nameLabel: 'Votre nom',
      talk: "et j'aimerais vous parler",
      topic: 'Sujet',
      own: 'votre propre sujet…',
      ownLabel: 'Votre propre sujet',
      reach: 'Vous pouvez me joindre à',
      email: 'votre e-mail',
      emailLabel: 'Votre e-mail',
      send: 'Envoyer',
    },
    mail: {
      someone: "quelqu'un",
      other: "d'autre chose",
      subject: 'On parle {about} ?',
      body: "Bonjour Samba,\n\nJe m'appelle {who} et j'aimerais vous parler {about}.\n",
      reply: 'Vous pouvez me joindre à {reply}.\n',
    },
    marquee: ['Concrétisons-le', 'Dites bonjour', "N'hésitez pas"],
    bigHint: "N'hésitez pas",
    big: 'Travaillons ensemble',
    badge: 'DITES BONJOUR ✺ DITES BONJOUR ✺ ',
    void: 'Continuez à défiler pour sortir de ma tête',
  },
};
