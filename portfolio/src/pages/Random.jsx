import ActivityRow from '../components/ActivityRow';
import AvatarScene from '../components/AvatarScene';
import { loadGroups, withImages } from '../lib/activities';
import '../css/pages.css';

/* Every photo dropped in src/assets/random/ is applied automatically:
   same filename prefix = same activity, new prefix = new activity. */
const GROUPS = loadGroups(
  import.meta.glob('../assets/random/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', {
    eager: true,
    import: 'default',
  })
);

const DEFS = [
  {
    slug: 'controller',
    title: 'Gaming sessions',
    desc: [
      'Controller in hand whenever the pipelines are green.',
      'Strategy and story-driven games first — reflexes are just a bonus.',
    ],
  },
  {
    slug: 'clash',
    title: 'No. 1 Clash Royale player in Mali',
    desc: [
      'Once climbed all the way to the number one spot of the Clash Royale ladder in Mali.',
      'Retired at the top. The ladder never forgets.',
    ],
  },
  {
    slug: 'crime_novel',
    title: 'Crime novels',
    desc: [
      'Devoted reader of crime fiction — the darker the plot, the better the night.',
      'Debugging and detective work are the same job with different fonts.',
    ],
  },
  {
    slug: 'rubiks',
    title: 'Speedcubing',
    desc: [
      "A Rubik's cube is never far from my keyboard.",
      'Solving one is my favorite way to reboot my brain between two deep work sessions.',
    ],
  },
  {
    slug: 'origami',
    title: 'Origami: the flapping bird',
    desc: [
      'I can fold the classic flapping bird — the one that actually flaps its wings when you pull the tail.',
      'Precision folding, zero merge conflicts.',
    ],
  },
  {
    slug: 'arabic',
    title: 'Reading Arabic',
    desc: [
      'I read Arabic script fluently.',
      'A different alphabet is just another encoding to parse.',
    ],
  },
  {
    slug: 'kanji',
    title: 'Japanese kanji (in progress)',
    desc: [
      'Currently learning to read Japanese kanji — character by character, radical by radical.',
      'Status: in progress. Loading bar moves every day.',
    ],
  },
  {
    slug: 'foot',
    title: 'Football weekends',
    desc: [
      'Football on weekends, chess when it rains, and an unreasonable amount of documentaries about space.',
      'I firmly believe debugging is easier after a good match.',
    ],
  },
  {
    slug: 'otaku',
    title: 'Otaku corner',
    desc: [
      'Anime nights are sacred — from classics to seasonal releases.',
      'Yes, the kanji learning and this hobby are absolutely connected.',
    ],
  },
  {
    slug: 'mangas',
    title: 'Manga collection',
    desc: [
      'A growing shelf of mangas, read and re-read.',
      'Paper first: some stories deserve better than a screen.',
    ],
  },
  {
    slug: 'music',
    title: 'Music on repeat',
    desc: [
      'Coding playlist: afrobeat for frontend, lo-fi for data pipelines, and complete silence for debugging production.',
      'Yes, the genre really does change the code quality. This is science.',
    ],
    stock: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80'],
  },
  {
    slug: 'fuel',
    title: 'Fuel',
    desc: [
      'Powered by cafe Touba, thieboudienne and the dopamine of a green CI pipeline.',
      'Deploy on Friday? Only with faith and a rollback plan.',
    ],
    stock: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80'],
  },
];

const FACTS = withImages(DEFS, GROUPS);

export default function Random() {
  return (
    <>
      <div className="hero-section hero-fun">
        <h1 className="title">Random</h1>
        <p className="subtitle">The human behind the terminal</p>
      </div>

      {FACTS.map((f, i) => (
        <section key={f.title} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...f} reverse={i % 2 === 1} />
        </section>
      ))}

      <section className="content-section">
        <AvatarScene variant="random" />
      </section>
    </>
  );
}
