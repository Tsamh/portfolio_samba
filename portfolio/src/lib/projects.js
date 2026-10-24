/* Projects shown on the Projects page, grouped by domain.
   Text comes from each repository's README; `fr` holds the fields that
   change in French (see localize in src/i18n). To replace a stock photo, drop
   src/assets/projects/<slug>.jpg (or png/webp) — or set `photo` to another
   file name in that folder. */

const LOCAL = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/projects/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', {
      eager: true,
      import: 'default',
    })
  ).map(([path, src]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), src])
);

const stock = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=675&q=75`;
const gh = (repo) => `https://github.com/Tsamh/${repo}`;

const RAW = {
  weathair: {
    title: 'Weath_Air',
    summary: 'Hourly weather ETL orchestrated with Apache Airflow.',
    details: [
      'An ETL pipeline orchestrated by Apache Airflow: a DAG extracts 7 weather variables from the OpenWeatherMap API, applies 5 transformations and loads the result into a SQLite database.',
      'The city, the API key and the database path come from environment variables, so the same pipeline runs anywhere.',
    ],
    fr: {
      summary: 'ETL météo horaire orchestré avec Apache Airflow.',
      details: [
        "Un pipeline ETL orchestré par Apache Airflow : un DAG extrait 7 variables météo de l'API OpenWeatherMap, applique 5 transformations et charge le résultat dans une base SQLite.",
        "La ville, la clé d'API et le chemin de la base viennent de variables d'environnement : le même pipeline tourne partout.",
      ],
    },
    stack: ['Apache Airflow', 'Python', 'OpenWeatherMap API', 'SQLite'],
    github: gh('Weath_Air'),
    image: stock('1504608524841-42fe6f032b4b'),
  },
  farsmart: {
    title: 'FAR_sMart',
    summary: 'Big data pipeline for a simulated farm of 4 connected fields.',
    details: [
      'A farm of 4 fields (wheat, maize, sunflower, soy) simulated in Webots: virtual robots send temperature, humidity, NPK and stress readings every few seconds.',
      'The readings flow through Apache Kafka, land as Parquet files in a MinIO (S3-compatible) data lake, and are cleaned and enriched every hour by Spark jobs triggered by Airflow, all the way to a dashboard for the farmer.',
    ],
    fr: {
      summary: 'Pipeline big data pour une ferme simulée de 4 champs connectés.',
      details: [
        'Une ferme de 4 champs (blé, maïs, tournesol, soja) simulée dans Webots : des robots virtuels envoient toutes les quelques secondes des relevés de température, d’humidité, de NPK et de stress.',
        "Les relevés transitent par Apache Kafka, arrivent en fichiers Parquet dans un data lake MinIO (compatible S3), puis sont nettoyés et enrichis chaque heure par des jobs Spark déclenchés par Airflow, jusqu'à un tableau de bord pour l'agriculteur.",
      ],
    },
    stack: ['Webots', 'Apache Kafka', 'MinIO', 'Apache Spark', 'Apache Airflow', 'Parquet'],
    github: gh('FAR_sMart'),
  },
  dataprocessing: {
    title: 'Data Processing',
    summary: '10 analysis notebooks and 161 charts, published as a website.',
    details: [
      'Data processing on real datasets: AI impact on jobs (with a Dash dashboard), COVID-19 cases, stroke and diabetes screening, customer anomaly detection, student performance, Titanic survival, CO2 emissions and more.',
      'Every notebook runs end to end from its own folder, and the results are published on a small site so they can be read without running anything.',
    ],
    fr: {
      summary: "10 notebooks d'analyse et 161 graphiques, publiés sous forme de site.",
      details: [
        "Traitement de données sur des jeux réels : impact de l'IA sur l'emploi (avec un tableau de bord Dash), cas de COVID-19, dépistage de l'AVC et du diabète, détection d'anomalies clients, résultats d'étudiants, survie sur le Titanic, émissions de CO2 et plus encore.",
        "Chaque notebook s'exécute de bout en bout depuis son propre dossier, et les résultats sont publiés sur un petit site pour être lus sans rien lancer.",
      ],
    },
    stack: ['pandas', 'seaborn', 'matplotlib', 'Plotly', 'Dash'],
    github: gh('Data_processing'),
    live: 'https://tsamh.github.io/Data_processing/',
  },
  scrapy: {
    title: 'CoinAfrique Scraper',
    summary: 'Streamlit app that scrapes and explores animal listings.',
    details: [
      'Scrapes CoinAfrique listings (dogs, sheep, poultry and more) across as many pages as needed with BeautifulSoup, then cleans them and exports CSV files.',
      'Other tabs load raw data collected with Web Scraper and turn the cleaned data into a dashboard.',
    ],
    fr: {
      summary: "Application Streamlit qui scrape et explore des annonces d'animaux.",
      details: [
        'Scrape les annonces CoinAfrique (chiens, moutons, volailles et plus) sur autant de pages que nécessaire avec BeautifulSoup, puis les nettoie et les exporte en CSV.',
        "D'autres onglets chargent les données brutes collectées avec Web Scraper et transforment les données nettoyées en tableau de bord.",
      ],
    },
    stack: ['Python', 'BeautifulSoup', 'Streamlit', 'pandas'],
    github: gh('Scrapy'),
    live: 'https://scrapy-by-sams.streamlit.app/',
    photo: 'Streamlit_animals',
  },
  nansa: {
    title: 'Nansa',
    summary: 'Marketplace for services, products and events.',
    details: [
      'Nansa is a marketplace where businesses and creators list their services, products and events, for locals and foreigners alike.',
      'Each business gets its own page in the marketplace, next to event tickets and gift cards. The platform is live in several countries, with more on the way.',
    ],
    stack: ['Marketplace', 'Web app', 'Mobile app'],
    fr: {
      summary: 'Marketplace de services, de produits et d’événements.',
      details: [
        'Nansa est une marketplace où entreprises et créateurs proposent leurs services, leurs produits et leurs événements, aux habitants comme aux étrangers.',
        "Chaque entreprise a sa propre page dans la marketplace, à côté des billets d'événements et des cartes cadeaux. La plateforme est en ligne dans plusieurs pays, et d'autres arrivent.",
      ],
      stack: ['Marketplace', 'Application web', 'Application mobile'],
    },
    live: 'https://nansa.app/',
  },
  cloudit: {
    title: 'ClouDIT',
    summary: 'Run Python on GPUs from the browser, with quotas and live tracking.',
    details: [
      'A distributed intensive-computing platform built for the Dakar Institute of Technology: users upload or write Python scripts and notebooks, which run in an isolated container on the GPU (an NVIDIA Jetson Thor today), with real-time tracking.',
      'Persistent workspace with natively executed notebooks, per-user quotas (40 runs per rolling 24 hours), an admin panel for resource limits, and a hexagonal architecture designed to grow from one GPU to several nodes without a rewrite.',
    ],
    fr: {
      summary: 'Exécuter du Python sur GPU depuis le navigateur, avec quotas et suivi en direct.',
      details: [
        "Une plateforme de calcul intensif distribué construite pour le Dakar Institute of Technology : les utilisateurs déposent ou écrivent des scripts et des notebooks Python, exécutés dans un conteneur isolé sur le GPU (une NVIDIA Jetson Thor aujourd'hui), avec un suivi en temps réel.",
        "Espace de travail persistant avec notebooks exécutés nativement, quotas par utilisateur (40 exécutions sur 24 heures glissantes), panneau d'administration pour les limites de ressources, et une architecture hexagonale pensée pour passer d'un GPU à plusieurs nœuds sans tout réécrire.",
      ],
    },
    stack: ['Python', 'Docker', 'React', 'TypeScript', 'Tailwind', 'NVIDIA Jetson'],
    github: gh('ClouDIT-public'),
  },
  ditmoitout: {
    title: 'DITMoiTouT',
    summary: 'Revision and study platform for DIT students.',
    details: [
      'A revision platform for the Dakar Institute of Technology: revision material, resources and teacher pages in one place.',
      'Built with Vue 3 and Vite, with an AI assistant students can talk to.',
    ],
    stack: ['Vue 3', 'Vite', 'AI assistant'],
    fr: {
      summary: 'Plateforme de révision pour les étudiants du DIT.',
      details: [
        'Une plateforme de révision pour le Dakar Institute of Technology : supports de révision, ressources et pages des enseignants au même endroit.',
        'Construite avec Vue 3 et Vite, avec un assistant IA auquel les étudiants peuvent parler.',
      ],
      stack: ['Vue 3', 'Vite', 'Assistant IA'],
    },
    github: gh('DITMoiTouT'),
    live: 'https://tsamh.github.io/DITMoiTouT/',
  },
  factuscript: {
    title: 'FactuScript',
    summary: 'Invoice generator that runs entirely in the browser.',
    details: [
      'Fill in the order, the client and the items: FactuScript computes the totals and generates the invoice as a PDF, with no server involved.',
      'Plain HTML, CSS and JavaScript, with jsPDF and jsPDF-AutoTable for the export.',
    ],
    fr: {
      summary: 'Générateur de factures qui tourne entièrement dans le navigateur.',
      details: [
        'On remplit la commande, le client et les articles : FactuScript calcule les totaux et génère la facture en PDF, sans aucun serveur.',
        "Du HTML, du CSS et du JavaScript simples, avec jsPDF et jsPDF-AutoTable pour l'export.",
      ],
    },
    stack: ['JavaScript', 'HTML', 'CSS', 'jsPDF'],
    github: gh('FactuScript'),
    live: 'https://tsamh.github.io/FactuScript/',
  },
  kabir: {
    title: 'Kabir Service',
    summary: 'Online shop for bikes, scooters and accessories.',
    details: [
      'E-commerce site for a bike shop: bikes, scooters and accessories, with category pages and filters by type, price, wheel size, battery range and brand.',
      'Promotions, stock status, prices in FCFA and product comparison, in a clean, image-first catalogue.',
    ],
    stack: ['E-commerce', 'Web'],
    photo: 'bikes',
    // not online yet: a badge stands where the "Live site" button will go
    status: 'In progress',
    fr: {
      summary: 'Boutique en ligne de vélos, trottinettes et accessoires.',
      details: [
        "Site e-commerce pour un magasin de vélos : vélos, trottinettes et accessoires, avec des pages par catégorie et des filtres par type, prix, taille de roue, autonomie de batterie et marque.",
        'Promotions, état du stock, prix en FCFA et comparaison de produits, dans un catalogue épuré qui met les images en avant.',
      ],
      status: 'En cours',
    },
  },
  cardioflow: {
    title: 'CardioFlow',
    summary: 'Heart-disease prediction taken from notebook to production.',
    details: [
      'End-to-end MLOps pipeline around a heart-disease prediction model (KNN and SVM-RBF): training with MLflow experiment tracking and a model registry.',
      'Served by a containerised FastAPI API, with a Streamlit app for interactive predictions and run monitoring, and a GitHub Actions CI that lints, tests, trains and builds the Docker image.',
    ],
    fr: {
      summary: 'Prédiction de maladies cardiaques, du notebook à la production.',
      details: [
        "Pipeline MLOps de bout en bout autour d'un modèle de prédiction de maladies cardiaques (KNN et SVM-RBF) : entraînement avec suivi des expériences dans MLflow et un registre de modèles.",
        "Servi par une API FastAPI conteneurisée, avec une application Streamlit pour les prédictions interactives et le suivi des exécutions, et une CI GitHub Actions qui vérifie le code, teste, entraîne et construit l'image Docker.",
      ],
    },
    stack: ['scikit-learn', 'MLflow', 'FastAPI', 'Streamlit', 'Docker', 'GitHub Actions'],
    github: gh('CardioFlow'),
  },
  gestures: {
    title: 'Hand gesture navigation',
    summary: 'Drive this site with your hand, through the webcam.',
    details: [
      'Computer vision running in this very portfolio: MediaPipe reads the 21 points of a hand from the webcam, and the palm moves a cursor across the page.',
      'A quick pinch clicks, a held pinch scrolls. The maths lives in a pure module (cursor position, click and scroll detection) covered by unit tests, and a dispatcher replays the gestures as real DOM events, so everything that answered the mouse answers the hand.',
      'The video never leaves the browser: no upload, no recording, and every camera track is released on exit.',
    ],
    stack: ['MediaPipe', 'Computer vision', 'JavaScript', 'WebAssembly'],
    fr: {
      title: 'Navigation à la main',
      summary: 'Pilotez ce site avec votre main, via la webcam.',
      details: [
        "De la vision par ordinateur qui tourne dans ce portfolio même : MediaPipe lit les 21 points d'une main depuis la webcam, et la paume déplace un curseur sur la page.",
        "Un pincement rapide clique, un pincement maintenu fait défiler. Les calculs vivent dans un module pur (position du curseur, détection du clic et du défilement) couvert par des tests unitaires, et un répartiteur rejoue les gestes comme de vrais événements DOM : tout ce qui répondait à la souris répond à la main.",
        "La vidéo ne quitte jamais le navigateur : aucun envoi, aucun enregistrement, et chaque flux de la caméra est libéré à la sortie.",
      ],
      stack: ['MediaPipe', 'Vision par ordinateur', 'JavaScript', 'WebAssembly'],
    },
    photo: 'hand_gesture',
    // no repository: the "See" button opens the feature right here
    demo: 'gestures',
  },
};

export const PROJECTS = Object.fromEntries(
  Object.entries(RAW).map(([slug, p]) => [
    slug,
    { slug, ...p, image: LOCAL[p.photo ?? slug] ?? p.image },
  ])
);

/* `mark` picks the hand-drawn illustration around the domain word:
   bars (green) for Data, swirl (yellow) for Software, loop (red) for AI */
export const DOMAINS = [
  {
    id: 'data',
    label: 'Data Engineering',
    word: 'Data',
    caption: 'Pipelines, processing & analytics.',
    keywords: ['ETL', 'Spark', 'Orchestration'],
    fr: { caption: 'Pipelines, traitement & analyse.' },
    mark: 'bars',
    projects: ['weathair', 'farsmart', 'dataprocessing', 'scrapy'],
  },
  {
    id: 'software',
    label: 'Software Engineering',
    word: 'Software',
    caption: 'Platforms, APIs & web apps.',
    keywords: ['Web apps', 'APIs', 'Distributed'],
    fr: {
      label: 'Génie logiciel',
      word: 'Logiciel',
      caption: 'Plateformes, API & applications web.',
      keywords: ['Applications web', 'API', 'Distribué'],
    },
    mark: 'swirl',
    projects: ['nansa', 'ditmoitout', 'factuscript', 'kabir'],
  },
  {
    id: 'ai',
    label: 'AI Engineering',
    word: 'AI',
    caption: 'Models, from training to production.',
    keywords: ['Machine learning', 'MLOps', 'GPU computing'],
    fr: {
      label: 'Ingénierie IA',
      word: 'IA',
      mark: 'loop-left',   // the I is on the left in "IA"
      caption: "Des modèles, de l'entraînement à la production.",
      keywords: ['Machine learning', 'MLOps', 'Calcul GPU'],
    },
    mark: 'loop',
    projects: ['cardioflow', 'gestures', 'cloudit'],
  },
];
