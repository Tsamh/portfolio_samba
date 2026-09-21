/* Contact links used across the site (navbar, Home, Contact). */
import { DEFAULT_CV } from './cv';

export const EMAIL = 'tsambahama@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/samba-hama-traore-925309351';
export const GITHUB = 'https://github.com/Tsamh';
/* same address, without the scheme, for the terminal */
export const LINKEDIN_PLAIN = 'linkedin.com/in/samba-hama-traore-925309351';
/* default document: the short Resume, data version */
export const CV = DEFAULT_CV.url;
export const CV_FILENAME = DEFAULT_CV.filename;

export const SOCIALS = [
  { icon: 'mail-fast',     label: 'Email',    value: EMAIL,                          href: `mailto:${EMAIL}` },
  { icon: 'logo-linkedin', label: 'LinkedIn', value: '/in/samba-hama-traore',       href: LINKEDIN },
  { icon: 'logo-github',   label: 'GitHub',   value: 'github.com/Tsamh',             href: GITHUB },
];
