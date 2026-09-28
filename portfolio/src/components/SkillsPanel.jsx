import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import LordIcon from './LordIcon';
import { SKILL_GROUPS, SKILLS } from '../lib/skills';
import '../css/SkillsPanel.css';

/* Official logos, stored in src/assets/skills/<file>.svg */
const LOGOS = import.meta.glob('../assets/skills/*.svg', { eager: true, import: 'default' });
const logo = (file) => LOGOS[`../assets/skills/${file}.svg`];

const EASE = [0.22, 1, 0.36, 1];

/* the two views cross-fade with a slight zoom and blur, while the box
   around them eases to its new height */
const VIEW = {
  initial: { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit:    { opacity: 0, scale: 1.03, filter: 'blur(6px)' },
  transition: { duration: 0.35, ease: EASE },
};

/* logos drop in one after the other */
const LIST = { animate: { transition: { staggerChildren: 0.025, delayChildren: 0.1 } } };
const ITEM = {
  initial: { opacity: 0, y: 12, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

function Logo({ name, file }) {
  return (
    <motion.li variants={ITEM} className="skill-logo" title={name}>
      <span className="skill-logo-tile">
        <img src={logo(file)} alt="" draggable={false} />
      </span>
      <span className="skill-logo-name">{name}</span>
    </motion.li>
  );
}

/**
 * Skills on Home: a compact grid of categories above the selected one's
 * logos, or every skill gathered in one grid. The button above switches
 * between the two views.
 */
export default function SkillsPanel() {
  const [all, setAll] = useState(true);   // opens on every skill at once
  const [active, setActive] = useState(SKILL_GROUPS[0].id);
  const group = SKILL_GROUPS.find((g) => g.id === active);

  /* The box eases to the height of what it holds. Measured rather than
     animated with `layout`, which scales the box and would squash the
     logos inside while it resizes. */
  const innerRef = useRef(null);
  const [height, setHeight] = useState('auto');
  useLayoutEffect(() => {
    const el = innerRef.current;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    /* .sk-all also widens the Home grid around it (SkillsPanel.css) */
    <div className={`skills-list${all ? ' sk-all' : ''}`}>
      <div className="sk-head">
        <h3>Skills</h3>
        <button
          type="button"
          className="sk-toggle"
          onClick={() => setAll((v) => !v)}
          aria-pressed={all}
        >
          <LordIcon name={all ? 'grid-bento' : 'eye'} size={20} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={all ? 'cat' : 'all'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {all ? 'By category' : 'View all'}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <motion.div
        className="sk-box"
        animate={{ height }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <div ref={innerRef}>
        <AnimatePresence mode="wait" initial={false}>
          {all ? (
            <motion.div key="all" className="sk-view" {...VIEW}>
              <motion.ul className="skills-logos" variants={LIST} initial="initial" animate="animate">
                {SKILLS.map((s) => <Logo key={s.name} {...s} />)}
              </motion.ul>
            </motion.div>
          ) : (
            <motion.div key="cat" className="sk-view" {...VIEW}>
              <div className="sk-cats" role="tablist" aria-label="Skill categories">
                {SKILL_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="tab"
                    aria-selected={g.id === active}
                    className={`sk-cat${g.id === active ? ' on' : ''}`}
                    onClick={() => setActive(g.id)}
                    title={g.label}
                  >
                    <span className="sk-cat-icon"><LordIcon name={g.icon} size={22} /></span>
                    <span className="sk-cat-name">{g.short}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={group.id}
                  className="sk-detail"
                  role="tabpanel"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <h4>{group.label}</h4>
                  <p>{group.blurb}</p>
                  <motion.ul className="skills-logos" variants={LIST} initial="initial" animate="animate">
                    {group.skills.map((s) => <Logo key={s.name} {...s} />)}
                  </motion.ul>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
