import { useEffect, useState } from 'react';

/**
 * Cycles through words with a typewriter effect:
 * type → pause → delete → next word.
 * @param {string[]} words
 * @param {number}   typeSpeed   ms per typed char
 * @param {number}   deleteSpeed ms per deleted char
 * @param {number}   pause       ms to hold a complete word
 */
export default function TypingText({
  words = [],
  typeSpeed = 90,
  deleteSpeed = 45,
  pause = 3000,
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex % words.length];
    let timeout;

    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => {
          setText(
            deleting
              ? word.slice(0, text.length - 1)
              : word.slice(0, text.length + 1)
          );
        },
        deleting ? deleteSpeed : typeSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pause]);

  return (
    <span className="typing-text">
      {text}
      <span className="typing-cursor">|</span>
    </span>
  );
}
