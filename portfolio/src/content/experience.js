/* Content of the Experience page: one folder per activity in
   src/assets/experience/<name>/, every photo picked up automatically. */
import { loadGroups, unsplash, withImages } from '../lib/activities';

const GROUPS = loadGroups(
  import.meta.glob('../assets/experience/*/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', {
    eager: true,
    import: 'default',
  })
);

const DEFS = [
  {
    slug: 'engagements',
    title: 'Engagements',
    desc: ['Three mandates, one idea: make the school a place where things happen.'],
    bullets: [
      'President of the student union (BDE): tech talks, workshops, cultural outings and campus events.',
      'President of the External Relations Committee: partnerships with tech associations, training sessions, guest speakers and company visits.',
      'Class delegate from first to third year: the voice of the class with the teaching team, and coordination of group projects.',
    ],
    stock: [
      '1573164574511-73c773193279',
      '1739298061740-5ed03045b280',
      '1472691681358-fdf00a4bfcfe',
      '1763462711669-263800467e26',
    ].map(unsplash),
  },
  
  {
    slug: 'solidarity',
    aliases: ['don_sang', 'ndogou'], // photos in experience/don_sang/ and experience/ndogou/
    title: 'Solidarity drives',
    desc: ['Two campaigns run with the student union, both about taking care of people.'],
    bullets: [
      'Blood donation drive: convincing students to give, and organising the collection on campus.',
      'Ndogou DIT 2025: organising the shared meal that breaks the fast during Ramadan.',
      'Handing out the meals, evening after evening, to students and staff.',
    ],
    stock: [
      '1536856136534-bb679c52a9aa',
      '1526016650454-68a6f488910a',
      '1661994215679-cde7c2c5c060',
    ].map(unsplash),
  },
  
  {
    slug: 'hackathon',
    aliases: ['hackaton'], // photos in src/assets/experience/hackaton/
    title: 'Hackathons & meetups',
    desc: [
      'Regular hackathon participant and community meetup organizer: building fast, shipping faster, and celebrating every demo.',
      'Representing my school at national tech events and AI challenges.',
    ],
    stock: ['1504384308090-c894fdcc538d', '1504384764586-bb4cdc1707b0'].map(unsplash),
  },
  
  {
    slug: 'events',
    aliases: ['saltis', 'indabax'], // photos in experience/saltis/ and experience/indabax/
    title: 'Tech events & company visits',
    desc: ['Meeting the ecosystem, on a booth, in a lecture hall or inside the companies themselves.'],
    bullets: [
      'SALTIS: representing DIT at the international exhibition for algorithms, science, technology and innovation in Senegal.',
      'Deep Learning IndabaX Senegal: workshops, research talks and hallway conversations.',
      'Company visits organised for the school, at Sensat among others.',
    ],
    stock: [
      '1761195689615-9469b65dac01',
      '1587825140708-dfaf72ae4b04',
      '1780072773684-028dafcfff0b',
    ].map(unsplash),
  },
  
  {
    slug: 'campus',
    aliases: ['integration', 'parc'], // photos in experience/integration/ and experience/parc/
    title: 'Campus life',
    desc: ['The student union also exists to get everyone out of the classroom.'],
    bullets: [
      'Integration Day 2025: board games, chess, video games and a lot of first handshakes for the new students.',
      'Outdoor team day: camouflage gear, masks on, strategy on the field and a well-earned picnic.',
    ],
    stock: ['1677188010559-0667a1ed33a0', '1588432815128-363254491e4e'].map(unsplash),
  },
  
  {
    slug: 'cours_python',
    title: 'Intensive Python course',
    desc: [
      'I gave an intensive Python training to new baccalaureate holders for the Dakar Institute of Technology.',
      'From their very first variables to working programs, and a certificate for everyone who made it to the end.',
    ],
    stock: [
      '1649180556628-9ba704115795',
      '1526379095098-d400fd0bf935',
      '1599507593499-a3f7d7d97667',
      '1624953587687-daf255b6b80a',
    ].map(unsplash),
  },
  
  {
    slug: 'graduations',
    aliases: ['graduation25', 'graduation26'],
    title: 'Graduations',
    desc: [
      'Every year we organize the graduation ceremony for the graduating class: 2025, 2026… while we wait for our own turn :)',
    ],
    stock: ['1623461487986-9400110de28e', '1541339907198-e08756dedf3f'].map(unsplash),
  },
  
  {
    slug: 'mentoring',
    title: 'Clubs & mentoring',
    desc: [
      'Running student clubs where we learn deep learning hands-on, and helping fellow students get their first certifications.',
      'Teaching is the fastest way to learn twice, so I mentor on Python, ML fundamentals and cloud basics.',
    ],
    stock: [
      '1531482615713-2afd69097998',
      '1655720357872-ce227e4164ba',
      '1659301254614-8d6a9d46f26a',
      '1758270704925-fa59d93119c1',
      '1616089804390-b2daa80dbf02',
    ].map(unsplash),
  },
];

export default withImages(DEFS, GROUPS);
