import { useEffect, useRef, useState } from 'react';
import { CV, EMAIL, GITHUB, LINKEDIN_PLAIN } from '../lib/links';
import { SKILLS } from '../lib/skills';
import { EGGS, EGG_TOTAL, foundEggs } from '../lib/eggs';
import { DOMAINS, PROJECTS } from '../lib/projects';
import terminalIcon from '../assets/icons/wired-lineal-1326-browser-terminal-hover-blinking.gif';
import '../css/Terminal.css';

const PAGES = ['home', 'projects', 'extra', 'random', 'contact'];
const PROMPT = 'samba@portfolio:~$';

/* A line is a plain string, or an object the renderer understands:
   { text, tone }  tone = cmd (blue) | err (red) | ok (green)
   { cmd, desc }   one row of the command list (name in yellow)
   `404` works but stays out of the list: it is an easter egg
   { banner }      the framed title, drawn with a CSS border */
const COMMANDS = [
  ['ls', 'list all pages'],
  ['cd <page>', 'navigate to a page (ex: cd projects)'],
  ['about', 'display bio and about info'],
  ['skills', 'list technical skills'],
  ['projects', 'list projects (--data, --software, --ai)'],
  ['contact', 'show contact info'],
  ['resume', 'open resume'],
  ['whoami', 'who are you?'],
  ['eggs', 'easter eggs found so far'],
  ['theme <mode>', 'light | dark | toggle'],
  ['help', 'show this list'],
  ['clear', 'clear the screen'],
  ['exit', 'close the terminal'],
];

const HELP = [
  'Available commands:',
  ...COMMANDS.map(([cmd, desc]) => ({ cmd, desc })),
  '',
];

const BANNER = [
  { banner: 'samba.dev \u00b7 portfolio terminal' },
  '',
  ...HELP,
];

/** wraps short items into padded columns */
function columns(items, perRow = 3, width = 18) {
  const rows = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push('  ' + items.slice(i, i + perRow).map((x) => x.padEnd(width)).join('').trimEnd());
  }
  return rows;
}

/* ── window-control icons (12×12, stroke = currentColor) ── */
const Icon = {
  minimize: <path d="M3 8h10" />,
  maximize: <rect x="3.2" y="3.2" width="9.6" height="9.6" rx="1.2" />,
  restore: (
    <>
      <rect x="2.4" y="5.4" width="8" height="8" rx="1.1" />
      <path d="M5.4 5.4V3.4a1 1 0 0 1 1-1h6.2a1 1 0 0 1 1 1v6.2a1 1 0 0 1-1 1h-2" />
    </>
  ),
  close: <path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" />,
};

function CtrlButton({ kind, tone, label, onClick }) {
  return (
    <button
      className={`t-btn ${tone}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={label}
      title={label}
      type="button"
    >
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
           stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {Icon[kind]}
      </svg>
    </button>
  );
}

/**
 * Floating terminal button (bottom-left, Lordicon animated icon) and the terminal window docked above it.
 * Minimising tucks the window into the button; clicking the button brings it
 * back exactly as it was (size, history, prompt).
 * @param {boolean}  open
 * @param {function} onOpen
 * @param {function} onClose
 * @param {function} onNavigate(pageIndex)
 * @param {'light'|'dark'} theme
 * @param {function} setTheme('light'|'dark')
 */
export default function Terminal({ open, onOpen, onClose, onNavigate, theme, setTheme }) {
  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  /* kept apart so a maximised window is still maximised once restored */
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  /* command history, walked with the up and down arrows */
  const history = useRef([]);
  const historyPos = useRef(-1);   // -1 = typing a new command

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setLines(BANNER);
      setInput('');
      history.current = [];
      historyPos.current = -1;
      setMinimized(false);
      setMaximized(false);
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  const minimize = () => {
    inputRef.current?.blur(); // don't keep typing into a hidden prompt
    setMinimized(true);
  };

  const restore = () => {
    setMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  /* the button: open → tuck away → bring back */
  const onFab = () => {
    if (!open) onOpen();
    else if (minimized) restore();
    else minimize();
  };

  /* Escape closes a visible window; a minimised one stays put */
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && open && !minimized && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, minimized, onClose]);

  /* keyboard shortcut: Ctrl + Alt + T opens, restores, or closes */
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T'))) return;
      e.preventDefault();
      if (!open) onOpen();
      else if (minimized) restore();
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, minimized, onOpen, onClose]);

  const toggleMaximize = () => setMaximized((m) => !m);

  const print = (...out) => setLines((l) => [...l, ...out]);

  const run = (raw) => {
    const cmd = raw.trim();
    print({ text: `${PROMPT} ${cmd}`, tone: 'cmd' });
    if (!cmd) return;

    history.current = [...history.current, cmd];
    historyPos.current = -1;

    const [name, ...args] = cmd.toLowerCase().split(/\s+/);
    const arg = args[0] || '';

    switch (name) {
      case 'help':
        print(...HELP);
        break;

      case 'ls':
      case 'pages':
        print(...PAGES.map((p, i) => `  ${i}  /${p}`), '');
        break;

      case 'cd':
      case 'goto':
      case 'open': {
        const target = arg.replace(/^\//, '');
        const index = /^\d+$/.test(target) ? Number(target) : PAGES.indexOf(target);
        if (index >= 0 && index < PAGES.length) {
          print({ text: `\u2192 navigating to /${PAGES[index]}`, tone: 'ok' }, '');
          onNavigate(index);
          setTimeout(onClose, 400);
        } else {
          print({ text: `cd: no such page: ${arg || '(empty)'}, try 'ls'`, tone: 'err' }, '');
        }
        break;
      }

      case 'home':
      case 'extra':
      case 'random': {
        const index = PAGES.indexOf(name);
        print({ text: `\u2192 navigating to /${name}`, tone: 'ok' }, '');
        onNavigate(index);
        setTimeout(onClose, 400);
        break;
      }

      case 'about':
        print(
          'Samba Hama Traore, data engineer and fullstack developer.',
          'Final year of a Big Data / AI degree at the Dakar Institute of',
          'Technology, specialised in data engineering: ingestion,',
          'transformation, modelling and pipeline orchestration.',
          'Every project is built end to end, documented and versioned.',
          '',
          { text: "type 'projects' to see what that looks like.", tone: 'ok' },
          ''
        );
        break;

      case 'skills':
        print('Technical skills:', ...columns(SKILLS.map((k) => k.name)), '');
        break;

      case 'projects': {
        const flag = arg.replace(/^--/, '');
        const wanted = flag ? DOMAINS.filter((d) => d.id === flag) : DOMAINS;

        if (flag && wanted.length === 0) {
          print({ text: `projects: unknown domain '${arg}' (--data, --software, --ai)`, tone: 'err' }, '');
          break;
        }

        wanted.forEach((d) => {
          print({ text: `${d.label}:`, tone: 'ok' });
          d.projects.forEach((slug) => {
            const project = PROJECTS[slug];
            print(`  ${project.title.padEnd(22)} ${project.summary}`);
          });
          print('');
        });
        break;
      }

      case 'contact':
        print(
          `  email      ${EMAIL}`,
          `  linkedin   ${LINKEDIN_PLAIN}`,
          `  github     ${GITHUB}`,
          ''
        );
        break;

      case 'resume':
      case 'cv':
        print({ text: '\u2192 opening the resume in a new tab', tone: 'ok' }, '');
        window.open(CV, '_blank', 'noopener');
        break;

      case 'theme': {
        if (arg === 'light' || arg === 'dark') {
          setTheme(arg);
          print({ text: `theme set to ${arg}`, tone: 'ok' }, '');
        } else if (arg === 'toggle' || arg === '') {
          const next = theme === 'light' ? 'dark' : 'light';
          setTheme(next);
          print({ text: `theme set to ${next}`, tone: 'ok' }, '');
        } else {
          print({ text: `theme: unknown mode '${arg}' (light | dark | toggle)`, tone: 'err' }, '');
        }
        break;
      }

      case 'whoami':
        print(
          'samba \u00b7 AI \u00b7 Data \u00b7 MLOps \u00b7 DevOps \u00b7 Fullstack engineer',
          'Based in Dakar, building the whole pipeline of intelligence.',
          ''
        );
        break;

      case '404':
      case 'lost':
        print({ text: '\u2192 opening the lost page', tone: 'ok' }, '');
        window.dispatchEvent(new Event('portfolio:lost'));
        setTimeout(onClose, 400);
        break;

      case 'eggs': {
        const found = foundEggs();
        print({ text: `easter eggs found: ${found.length}/${EGG_TOTAL}`, tone: 'ok' });
        // only the ones already found are named: the others stay a surprise
        found.forEach((id) => print(`  ${EGGS[id]}`));
        if (found.length < EGG_TOTAL) print('  ' + '.'.repeat(3) + ' keep looking');
        print('');
        break;
      }

      case 'clear':
        setLines([]);
        break;

      case 'exit':
      case 'quit':
        onClose();
        break;

      default:
        print({ text: `command not found: ${name}, type 'help'`, tone: 'err' }, '');
    }
  };

  /* up / down walk the history, like a real shell */
  const onInputKey = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const items = history.current;
    if (!items.length) return;
    e.preventDefault();

    if (e.key === 'ArrowUp') {
      const pos = historyPos.current < 0 ? items.length - 1 : Math.max(0, historyPos.current - 1);
      historyPos.current = pos;
      setInput(items[pos]);
      return;
    }

    if (historyPos.current < 0) return;
    const pos = historyPos.current + 1;
    if (pos >= items.length) {          // back to an empty prompt
      historyPos.current = -1;
      setInput('');
    } else {
      historyPos.current = pos;
      setInput(items[pos]);
    }
  };

  const fabLabel = !open ? 'Mode terminal' : minimized ? 'Rouvrir le terminal' : 'Réduire le terminal';

  return (
    <>
      <span className="terminal-fab-wrap">
        <button
          className={`terminal-fab${open ? ' open' : ''}${open && minimized ? ' tucked' : ''}`}
          onClick={onFab}
          aria-label={`${fabLabel} (Ctrl + Alt + T)`}
          aria-describedby="terminal-tip"
          aria-expanded={open && !minimized}
          type="button"
        >
          <img src={terminalIcon} alt="" className="terminal-fab-icon" draggable={false} />
        </button>

        {/* tooltip — shown on hover and on keyboard focus */}
        <span className="terminal-tip" id="terminal-tip" role="tooltip">
          {fabLabel}
          <span className="terminal-tip-combo">Ctrl + Alt + T</span>
        </span>
      </span>

      {open && (
        <div
          className={`terminal-window${minimized ? ' minimized' : ''}${maximized ? ' maximized' : ''}`}
          aria-hidden={minimized}
          inert={minimized ? '' : undefined}
          onClick={() => inputRef.current?.focus()}
        >
          {/* header: window controls left, title after them.
              Double-clicking the bar toggles maximise. */}
          <div className="terminal-header" onDoubleClick={toggleMaximize}>
            <div className="terminal-controls">
              <CtrlButton
                kind="close"
                tone="red"
                label="Fermer"
                onClick={onClose}
              />
              <CtrlButton
                kind="minimize"
                tone="yellow"
                label="Réduire"
                onClick={minimize}
              />
              <CtrlButton
                kind={maximized ? 'restore' : 'maximize'}
                tone="green"
                label={maximized ? 'Restaurer' : 'Agrandir'}
                onClick={toggleMaximize}
              />
            </div>

            <span className="terminal-title">samba@portfolio: ~</span>
          </div>

          <div className="terminal-body" ref={bodyRef}>
            {lines.map((l, i) => {
              if (typeof l !== 'string' && l.banner) {
                return <div key={i} className="terminal-banner">{l.banner}</div>;
              }
              if (typeof l !== 'string' && l.cmd) {
                return (
                  <div key={i} className="terminal-line">
                    <span className="t-name">{l.cmd}</span>
                    {l.desc}
                  </div>
                );
              }
              const { text, tone } = typeof l === 'string' ? { text: l } : l;
              return (
                <div key={i} className={`terminal-line${tone ? ` ${tone}` : ''}`}>
                  {text === '' ? ' ' : text}
                </div>
              );
            })}

            <form
              className="terminal-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                run(input);
                setInput('');
              }}
            >
              <span className="terminal-prompt">{PROMPT}</span>
              <input
                ref={inputRef}
                className="terminal-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
