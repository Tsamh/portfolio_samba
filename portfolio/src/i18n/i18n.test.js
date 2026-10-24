import { describe, expect, it } from 'vitest';
import en from './en';
import fr from './fr';

/* every path to a leaf, arrays counted as leaves of their own length */
function paths(node, prefix = '') {
  if (Array.isArray(node)) return [`${prefix}[${node.length}]`];
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe('dictionaries', () => {
  it('French has exactly the English keys', () => {
    const skipLength = (p) => p.replace(/\[\d+\]$/, '[]');
    expect(paths(fr).map(skipLength).sort()).toEqual(paths(en).map(skipLength).sort());
  });

  it('lists the pair up item by item where the layout depends on it', () => {
    // the contact form and the gesture modal pair their entries by index
    expect(fr.contact.topics).toHaveLength(en.contact.topics.length);
    expect(fr.contact.meta).toHaveLength(en.contact.meta.length);
    expect(fr.gesture.items).toHaveLength(en.gesture.items.length);
  });

  it('keeps the same placeholders in both languages', () => {
    const holes = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
    const walk = (a, b, at) => {
      if (typeof a === 'string') return expect(holes(b), at).toBe(holes(a));
      if (Array.isArray(a)) return undefined;
      Object.keys(a).forEach((k) => walk(a[k], b[k], `${at}.${k}`));
      return undefined;
    };
    walk(en, fr, 'root');
  });
});
