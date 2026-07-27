import ActivityRow from '../components/ActivityRow';
import AvatarScene from '../components/AvatarScene';
import { loadGroups, withImages } from '../lib/activities';
import '../css/pages.css';

/* Every photo dropped in src/assets/extra/ is applied automatically:
same filename prefix = same activity, new prefix = new activity. */
const GROUPS = loadGroups(
  import.meta.glob('../assets/extra/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', {
    eager: true,
    import: 'default',
  })
);

const DEFS = [
  {
    slug: 'community',
    title: 'Student Union President',
    desc: [
      'President of the student union (BDE) — leading tech talks, workshops and cultural outings that bring the community together.',
      'From AI conferences to museum visits, every event is a chance to connect people and ideas.',
    ],
    stock: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80'],
  },
  {
    slug: 'hackathon',
    title: 'Hackathons & meetups',
    desc: [
      'Regular hackathon participant and community meetup organizer — building fast, shipping faster, and celebrating every demo.',
      'Representing my school at national tech events and AI challenges.',
    ],
    stock: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'],
  },
  {
    slug: 'graduation26',
    title: 'Graduation 2026',
    desc: [
      'Next chapter loading — the 2026 ceremony in pictures.',
      'Same energy, new milestones.',
    ],
  },
   {
    slug: 'graduation25',
    title: 'Graduation 2025',
    desc: [
      'Cap, gown and a diploma that took a few thousand commits to earn.',
      'Celebrating the class of 2025 with the people who made the journey worth it.',
    ],
  },
  {
    slug: 'saltis',
    title: 'SALTIS',
    desc: [
      'Representing DIT at SALTIS — the international exhibition for algorithms, science, technology and innovation in Senegal.',
      'Presenting our programs and projects at the school booth, meeting the ecosystem.',
    ],
  },
  {
    slug: 'indabax',
    title: 'Deep Learning IndabaX',
    desc: [
      "Part of the IndabaX Senegal adventure — Africa's community-driven deep learning gathering.",
      'Workshops, research talks and hallway conversations that turn students into practitioners.',
    ],
  },
  {
    slug: 'mentoring',
    title: 'Workshops & mentoring',
    desc: [
      'Facilitating hands-on deep learning workshops and helping fellow students get their first certifications.',
      'Teaching is the fastest way to learn twice — I mentor on Python, ML fundamentals and cloud basics.',
    ],
    stock: ['https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80'],
  },
  {
    slug: 'techgood',
    title: 'Tech for good',
    desc: [
      'Contributing to projects that use data and AI for local impact — education, health awareness and access to information.',
      'I believe the best engineering serves the community it comes from.',
    ],
    stock: ['https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80'],
  },
  {
    slug: 'opensource',
    title: 'Open source & sharing',
    desc: [
      'Publishing utilities, notebooks and write-ups so others can learn from what I build — and improve it.',
      'Documentation is a love letter to the next developer. I write a lot of love letters.',
    ],
    stock: ['https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=900&q=80'],
  },
];

const ACTIVITIES = withImages(DEFS, GROUPS);

export default function Extra() {
  return (
    <>
      <div className="hero-section hero-social">
        <h1 className="title">Extra</h1>
        <p className="subtitle">Community, events &amp; giving back</p>
      </div>

      {ACTIVITIES.map((a, i) => (
        <section key={a.title} className={`content-section${i % 2 === 0 ? ' alt' : ''}`}>
          <ActivityRow {...a} reverse={i % 2 === 1} />
        </section>
      ))}

      <section className="content-section">
        <AvatarScene variant="extra" />
      </section>
    </>
  );
}
