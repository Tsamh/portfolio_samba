/* The CVs live in src/assets/cv/ as
   <Resume|CV>_Samba_Hama_TRAORE_<Domain>_Engineer.pdf
   Only one domain is shown (DOMAIN below); the ATS version is the default. */

const FILES = import.meta.glob('../assets/cv/*.pdf', { eager: true, import: 'default' });

const file = (kind, domain) =>
  FILES[`../assets/cv/${kind}_Samba_Hama_TRAORE_${domain}_Engineer.pdf`];

/* change this to publish another version of the documents */
const DOMAIN = 'Data';

/* Resume = the plain ATS-friendly one, CV = the designed one */
export const KINDS = [
  { id: 'resume', label: 'ATS',     file: 'Resume' },
  { id: 'cv',     label: 'Graphic', file: 'CV' },
];

export const DEFAULT_KIND = 'resume';

/** @returns {{ url: string, filename: string }} */
export function cvDocument(kind) {
  const k = KINDS.find((x) => x.id === kind) ?? KINDS[0];
  return {
    url: file(k.file, DOMAIN),
    filename: `${k.file}_Samba_Hama_TRAORE_${DOMAIN}_Engineer.pdf`,
  };
}

/* used by the terminal's `resume` command and by the links module */
export const DEFAULT_CV = cvDocument(DEFAULT_KIND);
