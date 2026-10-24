/* Content of the Random page: one folder per activity in
   src/assets/random/<name>/, every photo picked up automatically.
   `fr` holds the fields that change in French. */
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
    fr: {
      title: 'Les mains dans le matériel',
      desc: ["Quand quelque chose ne marche plus, je l'ouvre avant de le remplacer."],
      bullets: [
        'Réparer des manettes de console : joystick cassé, bouton mort, stick qui dérive.',
        "Démonter un PC jusqu'à la dernière vis, et le remonter.",
        'Y installer des systèmes d’exploitation, et remettre chaque pilote à sa place.',
      ],
    },
    stock: [
      '1654593114209-d915f46be333',
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
    fr: {
      title: 'Étagères de papier',
      desc: ["Deux piles grandissent à côté de mon bureau, et aucune n'est numérique."],
      bullets: [
        "Les romans policiers : plus l'intrigue est sombre, meilleure est la nuit. Déboguer et enquêter, c'est le même métier avec d'autres polices.",
        "Une étagère de mangas qui ne cesse de grandir, lus et relus. Certaines histoires méritent mieux qu'un écran.",
      ],
    },
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
    fr: {
      title: "Jeux d'esprit",
      desc: ['Tout ce qui a un plateau, un classement ou un algorithme à battre.'],
      bullets: [
        "Speedcubing : un Rubik's cube n'est jamais loin de mon clavier, et en résoudre un, c'est ma façon de redémarrer mon cerveau.",
        "Clash Royale : un jour numéro un au Mali dans le classement. Retraité au sommet.",
        'Les échecs : plus lents, plus calmes, et tout aussi têtus.',
      ],
    },
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
    fr: {
      title: 'Autres alphabets',
      desc: ["Un autre alphabet, ce n'est qu'un autre encodage à décoder."],
      bullets: [
        "Je lis couramment l'écriture arabe.",
        "J'apprends à lire les kanji japonais, caractère par caractère, radical par radical. Statut : en cours.",
      ],
    },
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
    fr: {
      title: 'Rituels du week-end',
      desc: ['Les deux choses qui me sortent la semaine de la tête.'],
      bullets: [
        "« Toi aussi tu joues au foot ?! » : c'est le genre de phrase que j'entends à chaque fois. Oui, je n'en ai pas l'air, et je ne me débrouille pas mal.",
        "Les soirées animés sont sacrées, des classiques aux sorties de la saison. Oui, l'apprentissage des kanji et ça sont totalement liés.",
      ],
    },
    stock: [
      '1579952363873-27f3bade9f55',
      '1621478374422-35206faeddfb',
      '1574629810360-7efbbe195018',
      '1714537097791-be0ba0473b9c',
    ].map(unsplash),
  },
];

export default withImages(DEFS, GROUPS);
