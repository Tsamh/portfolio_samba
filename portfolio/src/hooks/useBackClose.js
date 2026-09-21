import { useEffect } from 'react';

/**
 * Makes the browser's Back button (and the phone's back gesture) close a
 * popup instead of leaving the site: while the popup is open an extra
 * history entry is pushed, and popping it closes the popup.
 *
 * The push is deferred by a tick on purpose. React runs an effect, cleans it
 * up and runs it again on every mount in development (StrictMode): pushing
 * straight away made the cleanup call history.back(), whose popstate arrived
 * after the second push and closed the popup the instant it opened.
 *
 * @param {boolean}  open
 * @param {function} onClose
 */
export function useBackClose(open, onClose) {
  useEffect(() => {
    if (!open) return;

    let pushed = false;
    const timer = setTimeout(() => {
      history.pushState({ popup: true }, '');
      pushed = true;
    }, 0);

    const onPop = () => {
      if (!pushed) return;   // not our entry
      pushed = false;        // it is already gone
      onClose();
    };
    window.addEventListener('popstate', onPop);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', onPop);
      // closed from the UI: drop the entry we added, so Back keeps working
      if (pushed) {
        pushed = false;
        history.back();
      }
    };
  }, [open, onClose]);
}
