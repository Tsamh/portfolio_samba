/* Certificates and attestations. The photos live in src/assets/certificats/
   (one <slug>.jpg per entry); AWS Educate badges have no paper to show. */

const PHOTOS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/certificats/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}', {
      eager: true,
      import: 'default',
    })
  ).map(([path, src]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), src])
);

export const CERTIFICATES = [
  {
    slug: 'python-workshop',
    title: 'Python workshop trainer',
    issuer: 'Dakar Institute of Technology',
    date: 'September 2026',
    note: 'Attestation of thanks for running the Python programming workshop.',
  },
  {
    slug: 'dit-hackathon',
    title: 'DIT Hackathon 2026',
    issuer: 'Dakar Institute of Technology',
    date: 'August 2026',
    note: 'Team project: a smart management platform for entrepreneurs and small businesses.',
  },
  {
    slug: 'itma-entrepreneurship',
    title: 'ITMA entrepreneurship contest',
    issuer: 'IPTAM, Bamako',
    date: '2022 / 2023',
    note: 'Merit attestation for the project taken to the student entrepreneurship contest.',
  },
  {
    slug: 'canva-training',
    title: 'Graphic design with Canva',
    issuer: 'Club IT ITMA & Comput-Mali',
    date: 'May / June 2023',
    note: 'Training session on graphic design, from the first sketch to the finished visual.',
  },
].map((c) => ({ ...c, image: PHOTOS[c.slug] }));

/* AWS Educate training badges, verified on Credly */
const CREDLY = 'https://www.credly.com/badges';

export const BADGES = [
  {
    slug: 'aws-databases',
    title: 'AWS Educate Getting Started with Databases',
    url: `${CREDLY}/cf9b84c2-75c1-4b72-ba14-6b074609fb7c/public_url`,
  },
  {
    slug: 'aws-storage',
    title: 'AWS Educate Getting Started with Storage',
    url: `${CREDLY}/6c0a804f-d587-4619-85f2-42bfd064147f/public_url`,
  },
  {
    slug: 'aws-networking',
    title: 'AWS Educate Getting Started with Networking',
    url: `${CREDLY}/fbebd1d7-4fa5-4207-9b13-aafe349b8072/public_url`,
  },
  {
    slug: 'aws-security',
    title: 'AWS Educate Getting Started with Security',
    url: `${CREDLY}/828ba575-bfd7-40ff-b649-aed83dfb5f0c/public_url`,
  },
].map((b) => ({
  ...b,
  issuer: 'Amazon Web Services Training and Certification',
  date: 'Issued Jul 2, 2025',
  image: PHOTOS[b.slug],
}));
