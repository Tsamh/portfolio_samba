import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import en from './en';
import fr from './fr';
import '../css/lang.css';

/* Two languages: English is the reference, French mirrors its keys. A key
   missing in fr.js falls back to the English text rather than breaking. */
const DICTS = { en, fr };
export const LANGS = ['en', 'fr'];

/* the saved choice, else the browser's language */
function initialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (LANGS.includes(saved)) return saved;
  } catch { /* storage blocked: fall through */ }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

const lookup = (dict, key) => key.split('.').reduce((o, k) => o?.[k], dict);

/** `{name}` placeholders in a string, filled from vars. */
const fill = (text, vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : text;

/**
 * Data written in English with a `fr` block beside it (projects, activities,
 * certificates…): in French the block's fields replace the English ones.
 */
export function localize(item, lang) {
  return lang === 'fr' && item?.fr ? { ...item, ...item.fr } : item;
}

/* Read outside React (the terminal's output, the egg toasts): the module
   keeps the current language in step with the provider. */
let current = initialLang();
export const currentLang = () => current;
export function translate(key, vars, lang = current) {
  const value = lookup(DICTS[lang], key) ?? lookup(en, key) ?? key;
  return typeof value === 'string' ? fill(value, vars) : value;
}

const LangContext = createContext(null);

/**
 * The swap itself is wrapped in a View Transition: the old page fades out
 * with a light blur while the new text fades in, so only what changes
 * appears to move. Browsers without the API get the same fade on #root.
 */
function smoothly(apply) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return apply();

  const root = document.documentElement;
  if (document.startViewTransition) {
    root.classList.add('lang-switch');
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => root.classList.remove('lang-switch'));
    return;
  }

  root.classList.add('lang-fading');
  setTimeout(() => {
    apply();
    requestAnimationFrame(() => root.classList.remove('lang-fading'));
  }, 220);
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const langRef = useRef(lang);
  langRef.current = lang;
  current = lang;

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch { /* not saved, still works */ }
    window.dispatchEvent(new Event('portfolio:lang'));
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next) || next === langRef.current) return;
    smoothly(() => flushSync(() => setLangState(next)));
  }, []);

  const value = useMemo(() => ({
    lang,
    setLang,
    toggle: () => setLang(langRef.current === 'en' ? 'fr' : 'en'),
    t: (key, vars) => translate(key, vars, lang),
  }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** @returns {{ lang: 'en'|'fr', setLang: function, toggle: function, t: function }} */
export function useLang() {
  return useContext(LangContext);
}
