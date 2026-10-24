/* English texts of the interface. fr.js mirrors these keys; data with a lot
   of prose (projects, activities, certificates, skills) carries its French
   next to the English in its own file, in a `fr` block. */
export default {
  lang: {
    toggle: 'Change language',
    switchTo: 'Passer en français',
  },

  theme: {
    toggle: 'Toggle theme',
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
  },

  navbar: {
    home: 'Back to Home',
    menu: 'Toggle menu',
  },

  nav: {
    home: { label: 'Home' },
    projects: { label: 'Projects', extra: ' & Certificates' },
    experience: { label: 'Experience' },
    random: { label: 'Random' },
    contact: { label: 'Contact' },
  },

  home: {
    roles: ['Data & AI', 'Software'],
    // "<typed role> Engineer"
    title: { before: '', after: 'Engineer' },
    subtitle: 'Pipelines, platforms and models, end to end',
    seeCv: 'See CV',
    chibi: 'Chibi Samba',
    hello: 'Hello.',
    about: [
      "I'm an engineer who lives across the whole stack of intelligence: I design and train models, build the data pipelines that feed them, automate the infrastructure they run on, and ship the web apps people use to interact with them.",
      'Based in Dakar, working globally. Available for freelance, full-time, and collaborations that push what machines can do.',
    ],
  },

  skills: {
    title: 'Skills',
    byCategory: 'By category',
    viewAll: 'View all',
    categories: 'Skill categories',
  },

  cv: {
    label: 'Resume preview',
    // the ATS resume is written in English, the designed CV in French
    kinds: { resume: 'ATS · EN', cv: 'Graphic · FR' },
    switchTo: 'Switch to the {kind} version',
    download: 'Download',
    close: 'Close preview',
    loading: 'Loading preview…',
    error: 'The preview could not be displayed. You can still download the document above.',
  },

  projects: {
    title: { before: 'Selected', word: 'projects' },
    sub: {
      click: 'Click a domain',
      wide: 'on the right',
      narrow: 'just below',
      then: ', then click a project for the details.',
    },
    domains: 'Domains',
    more: 'Click for details',
    open: 'Open details',
  },

  project: {
    close: 'Close',
    github: 'GitHub',
    live: 'Live site',
    see: 'See',
  },

  certs: {
    title: 'Certificates & attestations',
    sub: 'Training badges and the paper trail: what I was trained on, ran or entered.',
    onCredly: '{title} on Credly',
    openCredly: 'Open on Credly',
    attestations: 'Attestations',
    close: 'Close',
  },

  experience: {
    title: 'Experience',
    subtitle: 'Community, events & giving back',
  },

  random: {
    title: 'Random',
    subtitle: 'Random things about me',
  },

  gesture: {
    start: 'Navigate with hand gestures',
    stop: 'Stop hand navigation',
    title: 'Navigate with your hand',
    subtitle: 'Point your webcam at yourself and drive the whole site without touching anything.',
    items: [
      { title: 'Show Hand', text: 'Show your palm to move the cursor around the page' },
      { title: 'Quick pinch', text: 'Pinch your thumb and index finger to click on elements' },
      { title: 'Pinch & Drag', text: 'Pinch and drag up or down to scroll' },
    ],
    privacy: {
      title: 'No spying, promise.',
      text: "The video never leaves your browser: no upload, no recording, no server, no secret folder of your face. It all runs locally, and the camera shuts off the moment you exit. I'm a developer, not the NSA.",
    },
    errors: {
      blocked: 'Camera access was blocked. Allow it for this site in your browser settings (the icon at the left of the address bar), then try again.',
      missing: 'No camera found. Plug one in and try again.',
      busy: 'The camera is already in use by another application. Close it and try again.',
      insecure: 'Camera access needs a secure connection. Open this site over https, or on localhost.',
      failed: 'Hand tracking failed to start. Reload the page and try again.',
    },
    cancel: 'Cancel',
    enable: 'Enable camera',
    loading: 'Loading model…',
    preview: {
      show: 'Show camera',
      hide: 'Hide',
      showLabel: 'Show camera preview',
      hideLabel: 'Hide camera preview',
    },
  },

  scrollHint: {
    text: 'can scroll',
    prev: 'Go to the previous page',
    next: 'Go to the next page',
  },

  outro: {
    bye: 'Goodbye!',
    thanks: 'Thanks for visiting.',
    home: 'Back to start',
  },

  lost: {
    label: 'Page not found',
    title: 'You found the lost page',
    text: 'Nothing lives here, so knock the 404 down. Move with the mouse or the arrow keys.',
    back: 'Back to the site',
    left: '{n} bricks left',
    launch: 'Click or press space to launch',
    missed: 'Missed. Click to launch again',
    lost: 'The 404 stands. Click to try again',
    won: 'Nothing left to find. Click to rebuild it',
  },

  avatar: {
    note: [
      'Going through my pockets?!',
      'Fine... here is my secret:',
      "I still google 'how to center a div'",
      'every single time.',
    ],
    alt: "Samba's avatar",
    putAway: 'Put the note away',
    pocket: 'Jacket pocket',
  },

  loader: 'Loading',

  terminal: {
    available: 'Available commands:',
    cmds: {
      ls: 'list all pages',
      cd: 'navigate to a page (ex: cd projects)',
      about: 'display bio and about info',
      skills: 'list technical skills',
      projects: 'list projects (--data, --software, --ai)',
      contact: 'show contact info',
      resume: 'open resume',
      whoami: 'who are you?',
      eggs: 'easter eggs found so far',
      eggsReset: 'forget them all, to hunt again',
      theme: 'light | dark | toggle',
      lang: 'en | fr | toggle',
      help: 'show this list',
      clear: 'clear the screen',
      exit: 'close the terminal',
    },
    navigating: '→ navigating to /{page}',
    noPage: "cd: no such page: {page}, try 'ls'",
    empty: '(empty)',
    about: [
      'Samba Hama Traore, data engineer and fullstack developer.',
      'Final year of a Big Data / AI degree at the Dakar Institute of',
      'Technology, specialised in data engineering: ingestion,',
      'transformation, modelling and pipeline orchestration.',
      'Every project is built end to end, documented and versioned.',
    ],
    aboutHint: "type 'projects' to see what that looks like.",
    skills: 'Technical skills:',
    unknownDomain: "projects: unknown domain '{arg}' (--data, --software, --ai)",
    resume: '→ opening the resume in a new tab',
    themeSet: 'theme set to {mode}',
    themeUnknown: "theme: unknown mode '{arg}' (light | dark | toggle)",
    langSet: 'language set to English',
    langUnknown: "lang: unknown language '{arg}' (en | fr | toggle)",
    whoami: [
      'samba · AI · Data · MLOps · DevOps · Fullstack engineer',
      'Based in Dakar, building the whole pipeline of intelligence.',
    ],
    lost: '→ opening the lost page',
    eggsReset: 'easter eggs forgotten: happy hunting, again',
    eggsFound: 'easter eggs found: {n}/{total}',
    keepLooking: 'keep looking',
    notFound: "command not found: {name}, type 'help'",
    fab: {
      open: 'Terminal mode',
      restore: 'Reopen the terminal',
      minimize: 'Minimize the terminal',
    },
    ctrl: {
      close: 'Close',
      minimize: 'Minimize',
      maximize: 'Maximize',
      restore: 'Restore',
    },
  },

  eggs: {
    found: 'Easter egg found',
    counter: 'Easter eggs',
    names: {
      pocket: 'The note in his pocket',
      avatar: 'The avatar behind the site',
      lost: 'The lost page',
    },
  },

  quoteMarks: { open: '"', close: '"' },
  quotes: [
    { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
    { text: 'In order to be irreplaceable, one must always be different.', author: 'Coco Chanel' },
    { text: 'Java is to JavaScript what car is to Carpet.', author: 'Chris Heilmann' },
    { text: 'Knowledge is power.', author: 'Francis Bacon' },
    { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: 'Dan Salomon' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'Before software can be reusable it first has to be usable.', author: 'Ralph Johnson' },
    { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { text: 'The best error message is the one that never shows up.', author: 'Thomas Fuchs' },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: 'Cory House' },
    { text: 'Fix the cause, not the symptom.', author: 'Steve Maguire' },
    { text: 'Optimism is an occupational hazard of programming; feedback is the treatment.', author: 'Kent Beck' },
    { text: 'When to use iterative development? You should use iterative development almost always.', author: 'Martin Fowler' },
  ],

  activity: {
    photo: '{title}, photo {n}',
    more: 'Click to see more',
    prev: 'Previous photo',
    next: 'Next photo',
    close: 'Close',
  },

  contact: {
    title: { before: "Let's make your project", word: 'intelligent', after: '!' },
    lead: 'AI systems, data platforms, cloud infrastructure or fullstack apps: whether you have a precise brief or just an idea, my inbox is open.',
    findMe: 'Find me on',
    now: 'Right now in Dakar',
    meta: [
      { label: 'Location',  value: 'Dakar, Sénégal' },
      { label: 'Timezone',  value: 'GMT (UTC+0)' },
      { label: 'Response',  value: '< 24 hours' },
      { label: 'Languages', value: 'FR / EN' },
    ],
    note: 'Based in Dakar, working globally. Open to remote, on-site and hybrid setups.',
    write: 'Or write it here',
    topics: ['an AI system', 'a data platform', 'cloud infrastructure', 'a fullstack app', 'just an idea'],
    form: {
      hi: 'Hi Samba, my name is',
      name: 'your name',
      nameLabel: 'Your name',
      talk: "and I'd like to talk about",
      topic: 'Topic',
      own: 'your own subject…',
      ownLabel: 'Your own subject',
      reach: 'You can reach me at',
      email: 'your email',
      emailLabel: 'Your email',
      send: 'Send it',
    },
    mail: {
      someone: 'someone',
      other: 'something else',
      subject: 'Project: {about}',
      body: "Hi Samba,\n\nMy name is {who} and I'd like to talk about {about}.\n",
      reply: 'You can reach me at {reply}.\n',
    },
    marquee: ["Let's make it happen", 'Say hello', "Don't be a stranger"],
    bigHint: "Don't be a stranger",
    big: "Let's work together",
    badge: 'SAY HELLO ✺ SAY HELLO ✺ SAY HELLO ✺ ',
    void: 'Keep scrolling to leave my head',
  },
};
