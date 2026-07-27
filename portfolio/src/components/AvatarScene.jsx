import avatarSrc from '../assets/avatar/normal.png';
import '../css/AvatarScene.css';

/* Page-themed avatar scenes — inspired by assets/avatar/ref.png:
   the character is shown in a different SITUATION on every page,
   with CSS-drawn props (laptop, phone, controller, badge, bubble). */
const VARIANTS = {
  home: {
    bg: 'linear-gradient(135deg, #6d4fc4, #3b2a72)',
    caption: 'Hi, I am Samba — welcome to my world',
  },
  projects: {
    bg: 'linear-gradient(135deg, #2f8f6b, #14532d)',
    caption: 'Deep in the code, do not disturb',
  },
  extra: {
    bg: 'linear-gradient(135deg, #2f6b8f, #1e3a5f)',
    caption: 'Badge on — community mode',
  },
  random: {
    bg: 'linear-gradient(135deg, #c98f0a, #6b4c00)',
    caption: 'Player one, ready',
  },
  contact: {
    bg: 'linear-gradient(135deg, #4a4a4a, #111111)',
    caption: 'Already on the line — say hello',
  },
};

function Props({ variant }) {
  switch (variant) {
    case 'home':
      /* waving speech bubble */
      return <div className="sp sp-hello">Hello!</div>;

    case 'projects':
      /* laptop open in front of him, code blinking on the screen */
      return (
        <div className="sp sp-laptop">
          <div className="sp-screen">
            <span className="sp-code c1" />
            <span className="sp-code c2" />
            <span className="sp-code c3" />
          </div>
          <div className="sp-keyboard" />
        </div>
      );

    case 'extra':
      /* conference lanyard + badge on the chest */
      return (
        <div className="sp sp-badge">
          <span className="sp-strap left" />
          <span className="sp-strap right" />
          <span className="sp-card">DIT</span>
        </div>
      );

    case 'random':
      /* game controller in his hands */
      return (
        <div className="sp sp-pad">
          <span className="sp-cross" />
          <span className="sp-btn b1" />
          <span className="sp-btn b2" />
        </div>
      );

    case 'contact':
      /* phone at his ear + call waves */
      return (
        <>
          <div className="sp sp-phone" />
          <div className="sp sp-waves">
            <span />
            <span />
          </div>
        </>
      );

    default:
      return null;
  }
}

export default function AvatarScene({ variant = 'home' }) {
  const v = VARIANTS[variant] ?? VARIANTS.home;

  return (
    <div className="avatar-scene">
      <div className="avatar-scene-circle" style={{ background: v.bg }}>
        <img src={avatarSrc} alt="Samba's avatar" draggable={false} />
        <Props variant={variant} />
      </div>
      <span className="avatar-scene-caption">{v.caption}</span>
    </div>
  );
}
