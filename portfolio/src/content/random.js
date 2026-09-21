/* Content of the Random page: one folder per activity in
   src/assets/random/<name>/, every photo picked up automatically.

   The published build never imports this module: the deploy workflow sets
   VITE_SOON=1, and vite.config.js then resolves src/content/* to an empty
   stub. Photos and stories stay out of the bundle, and the page shows its
   "Coming soon" placeholder instead. */
import { loadGroups, unsplash, withImages } from '../lib/activities';

const GROUPS = loadGroups(
  import.meta.glob('../assets/random/*/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG}', {
    eager: true,
    import: 'default',
  })
);

const DEFS = [
  {
    slug: 'controller',
    title: 'Hands on hardware',
    desc: ['When something stops working, I open it before I replace it.'],
    bullets: [
      'Repairing console controllers: broken joystick, dead button, drifting stick.',
      'Taking a PC apart down to the last screw, and putting it back together.',
      'Installing operating systems on it, and getting every driver back in place.',
    ],
    stock: [
      '1699550403361-27dee0f2a415',
      '1721333091889-0b4fe5b2b28f',
      '1596302332910-07f3ac264d7b',
      '1712600095911-b38b10a80081',
    ].map(unsplash),
  },
  {
    slug: 'shelves',
    aliases: ['crime_novel', 'mangas'],
    title: 'Paper shelves',
    desc: ['Two piles grow next to my desk, and neither is digital.'],
    bullets: [
      'Crime fiction: the darker the plot, the better the night. Debugging and detective work are the same job with different fonts.',
      'A growing shelf of mangas, read and re-read. Some stories deserve better than a screen.',
    ],
    stock: [
      '1639065631134-641a4e1705f9',
      '1709675577966-6231e5a2ac43',
      '1760998934740-d5a5ac4a1563',
      '1705831156575-a5294d295a31',
    ].map(unsplash),
  },
  {
    slug: 'mindgames',
    aliases: ['rubiks', 'clash'],
    title: 'Mind games',
    desc: ['Anything with a board, a ladder or an algorithm to beat.'],
    bullets: [
      "Speedcubing: a Rubik's cube is never far from my keyboard, and solving one is how I reboot my brain.",
      'Clash Royale: once number one in Mali on the ladder. Retired at the top.',
      'Chess: slower, quieter, and just as stubborn.',
    ],
    stock: [
      '1597914377769-db5167cb0221',
      '1529699211952-734e80c4d42b',
      '1564049489314-60d154ff107d',
      '1536743939714-23ec5ac2dbae',
    ].map(unsplash),
  },
  {
    slug: 'scripts',
    aliases: ['arabic', 'kanji'],
    title: 'Other alphabets',
    desc: ['A different alphabet is just another encoding to parse.'],
    bullets: [
      'I read Arabic script fluently.',
      'I am learning to read Japanese kanji, character by character, radical by radical. Status: in progress.',
    ],
    stock: [
      '1646229227468-ba6eb534d368',
      '1704859997121-abfda972b66c',
      '1601480905449-90fca867ad37',
      '1765188989413-b0f07270cd63',
      '1546638008-efbe0b62c730',
    ].map(unsplash),
  },
  {
    slug: 'weekends',
    aliases: ['foot', 'otaku'],
    title: 'Weekend rituals',
    desc: ['The two things that get the week out of my head.'],
    bullets: [
      '"Even you can play soccer ?!" is the kind of sentence I hear every time. Yes, I do not look like it, and I am not bad at it.',
      'Anime nights are sacred, from classics to seasonal releases. Yes, the kanji learning and this are absolutely connected.',
    ],
    stock: [
      '1579952363873-27f3bade9f55',
      '1621478374422-35206faeddfb',
      '1574629810360-7efbbe195018',
      '1714537097791-be0ba0473b9c',
    ].map(unsplash),
  },
  {
    slug: 'origami',
    title: 'Origami: the flapping bird',
    desc: [
      'I can fold the classic flapping bird, the one that actually flaps its wings when you pull the tail.',
      'Precision folding, zero merge conflicts.',
    ],
    stock: [
      '1563260797-cb5cd70254c8',
      '1764189450619-3d6b5ffccb60',
      '1708878641346-c33c649a923f',
      '1684239154527-d5f022f7f20d',
      '1586942729823-a31b812f9b98',
    ].map(unsplash),
  },
];

export default withImages(DEFS, GROUPS);
