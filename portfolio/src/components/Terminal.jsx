import { useEffect, useRef, useState } from 'react';
import { EMAIL, GITHUB, LINKEDIN_PLAIN } from '../lib/links';
import { cvDocument, DEFAULT_KIND } from '../lib/cv';
import { SKILLS } from '../lib/skills';
import { EGG_TOTAL, foundEggs, resetEggs } from '../lib/eggs';
import { DOMAINS, PROJECTS } from '../lib/projects';
import { localize, translate, useLang } from '../i18n';
import terminalIcon from '../assets/icons/wired-lineal-1326-browser-terminal-hover-blinking.gif';
import '../css/Terminal.css';

const PAGES = ['home', 'projects', 'experience', 'random', 'contact'];
const PROMPT = 'samba@portfolio:~$';

/* A line is a plain string, or an object the renderer understands:
   { text, tone }  tone = cmd (blue) | err (red) | ok (green)
   { cmd, desc }   one row of the command list (name in yellow)
   `404` works but stays out of the list: it is an easter egg
   { banner }      the framed title, drawn with a CSS border
   Command names stay in English, like any shell; what they print follows
   the site's language (terminal.* in i18n/). */
const COMMANDS = [
  ['ls', 'ls'],
  ['cd <page>', 'cd'],
  ['about', 'about'],
  ['skills', 'skills'],
  ['projects', 'projects'],
  ['contact', 'contact'],
  ['resume', 'resume'],
  ['whoami', 'whoami'],
  ['eggs', 'eggs'],
  ['eggs reset', 'eggsReset'],
  ['theme <mode>', 'theme'],
  ['lang <code>', 'lang'],
  ['help', 'help'],
  ['clear', 'clear'],
  ['exit', 'exit'],
];

const help = (t) => [
  t('terminal.available'),
  ...COMMANDS.map(([cmd, key]) => ({ cmd, desc: t(`terminal.cmds.${key}`) })),
  '',
];

const banner = (t) => [
  { banner: 'samba.dev \u00b7 portfolio terminal' },
  '',
  ...help(t),
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
  const { lang, setLang, t } = useLang();
  const [lines, setLines] = useState(() => banner(t));
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
      setLines(banner(t));
      setInput('');
      history.current = [];
      historyPos.current = -1;
      setMinimized(false);
      setMaximized(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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
        print(...help(t));
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
          print({ text: t('terminal.navigating', { page: PAGES[index] }), tone: 'ok' }, '');
          onNavigate(index);
          setTimeout(onClose, 400);
        } else {
          print({ text: t('terminal.noPage', { page: arg || t('terminal.empty') }), tone: 'err' }, '');
        }
        break;
      }

      case 'home':
      case 'experience':
      case 'random': {
        const index = PAGES.indexOf(name);
        print({ text: t('terminal.navigating', { page: name }), tone: 'ok' }, '');
        onNavigate(index);
        setTimeout(onClose, 400);
        break;
      }

      case 'about':
        print(
          ...t('terminal.about'),
          '',
          { text: t('terminal.aboutHint'), tone: 'ok' },
          ''
        );
        break;

      case 'skills':
        print(t('terminal.skills'), ...columns(SKILLS.map((k) => k.name)), '');
        break;

      case 'projects': {
        const flag = arg.replace(/^--/, '');
        const wanted = flag ? DOMAINS.filter((d) => d.id === flag) : DOMAINS;

        if (flag && wanted.length === 0) {
          print({ text: t('terminal.unknownDomain', { arg }), tone: 'err' }, '');
          break;
        }

        wanted.forEach((d) => {
          print({ text: `${localize(d, lang).label}:`, tone: 'ok' });
          d.projects.forEach((slug) => {
            const project = localize(PROJECTS[slug], lang);
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
        print({ text: t('terminal.resume'), tone: 'ok' }, '');
        // the document written in the site's language (French: the designed CV)
        window.open(cvDocument(lang === 'fr' ? 'cv' : DEFAULT_KIND).url, '_blank', 'noopener');
        break;

      case 'theme': {
        if (arg === 'light' || arg === 'dark') {
          setTheme(arg);
          print({ text: t('terminal.themeSet', { mode: arg }), tone: 'ok' }, '');
        } else if (arg === 'toggle' || arg === '') {
          const next = theme === 'light' ? 'dark' : 'light';
          setTheme(next);
          print({ text: t('terminal.themeSet', { mode: next }), tone: 'ok' }, '');
        } else {
          print({ text: t('terminal.themeUnknown', { arg }), tone: 'err' }, '');
        }
        break;
      }

      case 'lang': {
        const next = arg === 'toggle' || arg === '' ? (lang === 'en' ? 'fr' : 'en') : arg;
        if (next !== 'en' && next !== 'fr') {
          print({ text: t('terminal.langUnknown', { arg }), tone: 'err' }, '');
          break;
        }
        // answered in the language just picked
        print({ text: translate('terminal.langSet', null, next), tone: 'ok' }, '');
        setLang(next);
        break;
      }

      case 'whoami':
        print(...t('terminal.whoami'), '');
        break;

      case '404':
      case 'lost':
        print({ text: t('terminal.lost'), tone: 'ok' }, '');
        window.dispatchEvent(new Event('portfolio:lost'));
        setTimeout(onClose, 400);
        break;

      case 'eggs': {
        // a way to hunt them all again
        if (arg === 'reset') {
          resetEggs();
          print({ text: t('terminal.eggsReset'), tone: 'ok' }, '');
          break;
        }
        const found = foundEggs();
        print({ text: t('terminal.eggsFound', { n: found.length, total: EGG_TOTAL }), tone: 'ok' });
        // only the ones already found are named: the others stay a surprise
        found.forEach((id) => print(`  ${t(`eggs.names.${id}`)}`));
        if (found.length < EGG_TOTAL) print('  ' + '.'.repeat(3) + ' ' + t('terminal.keepLooking'));
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
        print({ text: t('terminal.notFound', { name }), tone: 'err' }, '');
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

  const fabLabel = t(!open ? 'terminal.fab.open' : minimized ? 'terminal.fab.restore' : 'terminal.fab.minimize');

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
                label={t('terminal.ctrl.close')}
                onClick={onClose}
              />
              <CtrlButton
                kind="minimize"
                tone="yellow"
                label={t('terminal.ctrl.minimize')}
                onClick={minimize}
              />
              <CtrlButton
                kind={maximized ? 'restore' : 'maximize'}
                tone="green"
                label={t(maximized ? 'terminal.ctrl.restore' : 'terminal.ctrl.maximize')}
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
