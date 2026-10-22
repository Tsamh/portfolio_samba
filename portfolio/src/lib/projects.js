/* Projects shown on the Projects page, grouped by domain.
   Text comes from each repository's README. To replace a stock photo, drop
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
    live: 'https://nansa.app/',
  },
  cloudit: {
    title: 'ClouDIT',
    summary: 'Run Python on GPUs from the browser, with quotas and live tracking.',
    details: [
      'A distributed intensive-computing platform built for the Dakar Institute of Technology: users upload or write Python scripts and notebooks, which run in an isolated container on the GPU (an NVIDIA Jetson Thor today), with real-time tracking.',
      'Persistent workspace with natively executed notebooks, per-user quotas (40 runs per rolling 24 hours), an admin panel for resource limits, and a hexagonal architecture designed to grow from one GPU to several nodes without a rewrite.',
    ],
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
  },
  cardioflow: {
    title: 'CardioFlow',
    summary: 'Heart-disease prediction taken from notebook to production.',
    details: [
      'End-to-end MLOps pipeline around a heart-disease prediction model (KNN and SVM-RBF): training with MLflow experiment tracking and a model registry.',
      'Served by a containerised FastAPI API, with a Streamlit app for interactive predictions and run monitoring, and a GitHub Actions CI that lints, tests, trains and builds the Docker image.',
    ],
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
    mark: 'bars',
    projects: ['weathair', 'farsmart', 'dataprocessing', 'scrapy'],
  },
  {
    id: 'software',
    label: 'Software Engineering',
    word: 'Software',
    caption: 'Platforms, APIs & web apps.',
    keywords: ['Web apps', 'APIs', 'Distributed'],
    mark: 'swirl',
    projects: ['nansa', 'ditmoitout', 'factuscript', 'kabir'],
  },
  {
    id: 'ai',
    label: 'AI Engineering',
    word: 'AI',
    caption: 'Models, from training to production.',
    keywords: ['Machine learning', 'MLOps', 'GPU computing'],
    mark: 'loop',
    projects: ['cardioflow', 'gestures', 'cloudit'],
  },
];
