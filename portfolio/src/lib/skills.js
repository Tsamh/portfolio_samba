/* Technical skills, grouped by area. Shown on Home (by category, or all at
   once) and listed by the terminal's `skills` command.
   `file` is an official logo in src/assets/skills/, `icon` a Lordicon in
   src/assets/icons/. */
export const SKILL_GROUPS = [
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    short: 'AI & ML',
    icon: 'magic-wand',
    blurb: 'Train, evaluate and ship models, from classic ML to LLM apps.',
    skills: [
      { name: 'Python',       file: 'python' },
      { name: 'PyTorch',      file: 'pytorch' },
      { name: 'TensorFlow',   file: 'tensorflow' },
      { name: 'scikit-learn', file: 'scikitlearn' },
      { name: 'Hugging Face', file: 'huggingface' },
      { name: 'LangChain',    file: 'langchain' },
    ],
  },
  {
    id: 'data',
    label: 'Data Engineering',
    short: 'Data',
    icon: 'load-balancer',
    blurb: 'Move, clean and shape data at scale, batch or streaming.',
    skills: [
      { name: 'Spark',   file: 'spark' },
      { name: 'Kafka',   file: 'kafka' },
      { name: 'Airflow', file: 'airflow' },
      { name: 'Hadoop',  file: 'hadoop' },
      { name: 'pandas',  file: 'pandas' },
      { name: 'NumPy',   file: 'numpy' },
    ],
  },
  {
    id: 'db',
    label: 'Databases',
    short: 'Databases',
    icon: 'server',
    blurb: 'Model and query data, relational or document.',
    skills: [
      { name: 'PostgreSQL', file: 'postgresql' },
      { name: 'MySQL',      file: 'mysql' },
      { name: 'MongoDB',    file: 'mongodb' },
      { name: 'SQLite',     file: 'sqlite' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    short: 'Cloud & DevOps',
    icon: 'cloud-code',
    blurb: 'Package, deploy and automate, with infrastructure as code.',
    skills: [
      { name: 'AWS',            file: 'aws' },
      { name: 'Google Cloud',   file: 'googlecloud' },
      { name: 'Docker',         file: 'docker' },
      { name: 'Kubernetes',     file: 'kubernetes' },
      { name: 'Terraform',      file: 'terraform' },
      { name: 'GitHub Actions', file: 'githubactions' },
      { name: 'Jenkins',        file: 'jenkins' },
    ],
  },
  {
    id: 'ops',
    label: 'Monitoring & Systems',
    short: 'Monitoring',
    icon: 'heart-beat',
    blurb: 'Keep services observable and running on solid ground.',
    skills: [
      { name: 'Prometheus', file: 'prometheus' },
      { name: 'Grafana',    file: 'grafana' },
      { name: 'Linux',      file: 'linux' },
      { name: 'Bash',       file: 'bash' },
      { name: 'Git',        file: 'git' },
    ],
  },
  {
    id: 'web',
    label: 'Software & Web',
    short: 'Software',
    icon: 'layers',
    blurb: 'Build the APIs and interfaces people actually use.',
    skills: [
      { name: 'TypeScript', file: 'typescript' },
      { name: 'JavaScript', file: 'javascript' },
      { name: 'React',      file: 'react' },
      { name: 'Vue.js',     file: 'vuejs' },
      { name: 'FastAPI',    file: 'fastapi' },
      { name: 'Flask',      file: 'flask' },
      { name: 'Java',       file: 'java' },
    ],
  },
];

/* every skill once, in group order */
export const SKILLS = SKILL_GROUPS.flatMap((g) => g.skills);
