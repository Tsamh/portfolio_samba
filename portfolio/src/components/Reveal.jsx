import { motion } from 'motion/react';

/**
 * Slide-in / slide-out reveal used by every content section.
 *
 * `viewport.once` is false so the very same animation plays in reverse when
 * the block leaves the viewport — appearance and disappearance are symmetric.
 *
 * @param {'left'|'right'} from - entrance direction
 */
export default function Reveal({ from = 'left', className = '', children }) {
  const hidden = { opacity: 0, x: from === 'left' ? -80 : 80 };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, x: 0 }}
      exit={hidden}
      viewport={{ once: false, amount: 0.15, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
