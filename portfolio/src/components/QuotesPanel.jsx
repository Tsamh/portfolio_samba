import { useState, useEffect } from 'react';
import '../css/QuotesPanel.css';

const FALLBACK_QUOTES = [
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
  { text: "Java is to JavaScript what car is to Carpet.", author: "Chris Heilmann" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: "Dan Salomon" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  { text: "Optimism is an occupational hazard of programming; feedback is the treatment.", author: "Kent Beck" },
  { text: "When to use iterative development? You should use iterative development almost always.", author: "Martin Fowler" },
];

async function fetchQuote() {
  try {
    const r = await fetch('https://api.quotable.io/quotes/random?tags=technology,knowledge,wisdom&limit=1', { signal: AbortSignal.timeout(3000) });
    if (!r.ok) throw new Error();
    const [data] = await r.json();
    return { text: data.content, author: data.author };
  } catch {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}

export default function QuotesPanel({ visible }) {
  const [quote,   setQuote]   = useState(FALLBACK_QUOTES[0]);
  const [fading,  setFading]  = useState(false);

  // rotate quote every 5 s
  useEffect(() => {
    if (!visible) return;

    // fetch a fresh quote when the panel opens
    fetchQuote().then(setQuote);

    const interval = setInterval(async () => {
      setFading(true);
      await new Promise(r => setTimeout(r, 400));
      const q = await fetchQuote();
      setQuote(q);
      setFading(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div className={`quotes-panel${visible ? ' visible' : ''}`}>
      <div className="quotes-deco">{ '//' }</div>
      <blockquote className={`quotes-text${fading ? ' fade' : ''}`}>
        "{quote.text}"
      </blockquote>
      <cite className={`quotes-author${fading ? ' fade' : ''}`}>
        — {quote.author}
      </cite>
    </div>
  );
}
