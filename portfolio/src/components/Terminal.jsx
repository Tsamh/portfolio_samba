import { useEffect, useRef, useState } from 'react';
import '../css/Terminal.css';

const PAGES = ['home', 'projects', 'extra', 'random', 'contact'];

const BANNER = [
  '┌─────────────────────────────────────┐',
  '│   seichi.dev — portfolio terminal   │',
  '└─────────────────────────────────────┘',
  '',
  'Available commands:',
  '  ls              list all pages',
  '  cd <page>       navigate to a page (ex: cd projects)',
  '  theme <mode>    light | dark | toggle',
  '  whoami          about the author',
  '  help            show this list',
  '  clear           clear the screen',
  '  exit            close the terminal',
  '',
];

/**
 * Fake terminal overlay for navigating the site.
 * @param {boolean}  open
 * @param {function} onClose
 * @param {function} onNavigate(pageIndex)
 * @param {'light'|'dark'} theme
 * @param {function} setTheme('light'|'dark')
 */
export default function Terminal({ open, onClose, onNavigate, theme, setTheme }) {
  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setLines(BANNER);
      setInput('');
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && open && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const print = (...out) => setLines((l) => [...l, ...out]);

  const run = (raw) => {
    const cmd = raw.trim();
    print(`seichi@portfolio:~$ ${cmd}`);
    if (!cmd) return;

    const [name, ...args] = cmd.toLowerCase().split(/\s+/);
    const arg = args[0] || '';

    switch (name) {
      case 'help':
        print(...BANNER.slice(4));
        break;

      case 'ls':
      case 'pages':
        print(...PAGES.map((p, i) => `  ${i}  /${p}`), '');
        break;

      case 'cd':
      case 'goto':
      case 'open': {
        const target = arg.replace(/^\//, '');
        const index = /^\d+$/.test(target)
          ? Number(target)
          : PAGES.indexOf(target);
        if (index >= 0 && index < PAGES.length) {
          print(`→ navigating to /${PAGES[index]}`, '');
          onNavigate(index);
          setTimeout(onClose, 400);
        } else {
          print(`cd: no such page: ${arg || '(empty)'} — try 'ls'`, '');
        }
        break;
      }

      case 'home':
      case 'projects':
      case 'extra':
      case 'random':
      case 'contact': {
        const index = PAGES.indexOf(name);
        print(`→ navigating to /${name}`, '');
        onNavigate(index);
        setTimeout(onClose, 400);
        break;
      }

      case 'theme': {
        if (arg === 'light' || arg === 'dark') {
          setTheme(arg);
          print(`theme set to ${arg}`, '');
        } else if (arg === 'toggle' || arg === '') {
          const next = theme === 'light' ? 'dark' : 'light';
          setTheme(next);
          print(`theme set to ${next}`, '');
        } else {
          print(`theme: unknown mode '${arg}' — light | dark | toggle`, '');
        }
        break;
      }

      case 'whoami':
        print(
          'seichi — AI · Data · MLOps · DevOps · Fullstack engineer',
          'Based in Dakar, building the whole pipeline of intelligence.',
          ''
        );
        break;

      case 'clear':
        setLines([]);
        break;

      case 'exit':
      case 'quit':
        onClose();
        break;

      default:
        print(`command not found: ${name} — type 'help'`, '');
    }
  };

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div
        className="terminal-window"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
      >
        <div className="terminal-header">
          <span className="t-dot red" onClick={onClose} />
          <span className="t-dot yellow" />
          <span className="t-dot green" />
          <span className="terminal-title">seichi@portfolio: ~</span>
        </div>

        <div className="terminal-body" ref={bodyRef}>
          {lines.map((l, i) => (
            <div key={i} className="terminal-line">{l === '' ? ' ' : l}</div>
          ))}

          <form
            className="terminal-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
              setInput('');
            }}
          >
            <span className="terminal-prompt">seichi@portfolio:~$</span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
