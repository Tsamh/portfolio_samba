/**
 * Translates gesture actions into DOM events aimed at whatever sits under
 * the cursor.
 *
 * Driving the page through events rather than through the app's own
 * navigation functions is what keeps this layer decoupled: anything that
 * already responds to a mouse responds to a hand, including components
 * added long after this was written.
 */

const CLICKABLE = 'a, button, [role="button"], .nav-link, input, textarea, select, label';

function mouseInit(x, y, extra) {
  return {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    ...extra,
  };
}

function fire(el, type, x, y, extra = {}) {
  const init = mouseInit(x, y, extra);
  const event = type.startsWith('pointer')
    ? new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', isPrimary: true, ...init })
    : new MouseEvent(type, init);
  el.dispatchEvent(event);
  return event;
}

/** mouseenter/mouseleave do not bubble, so they get their own init. */
function fireNonBubbling(el, type, x, y, relatedTarget) {
  el.dispatchEvent(
    new MouseEvent(type, {
      bubbles: false,
      cancelable: false,
      view: window,
      clientX: x,
      clientY: y,
      relatedTarget,
    })
  );
}

/**
 * Nearest ancestor that can actually scroll. In this portfolio that is
 * normally the `.page-scroll` container of the active page.
 */
function findScrollable(start) {
  let node = start;
  while (node && node !== document.body && node !== document.documentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      /(auto|scroll|overlay)/.test(overflowY) &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement;
}

export function createDispatcher() {
  let hovered = null;

  function elementAt(x, y) {
    return document.elementFromPoint(x, y);
  }

  function setHovered(el, x, y) {
    if (el === hovered) return;
    if (hovered) {
      fire(hovered, 'mouseout', x, y, { relatedTarget: el });
      fireNonBubbling(hovered, 'mouseleave', x, y, el);
      hovered.removeAttribute('data-gesture-hover');
    }
    if (el) {
      // React derives onMouseEnter/onMouseLeave from mouseover/mouseout at
      // the root, so this pair is what makes component hover logic work.
      fire(el, 'mouseover', x, y, { relatedTarget: hovered });
      fireNonBubbling(el, 'mouseenter', x, y, hovered);
      el.setAttribute('data-gesture-hover', '');
    }
    hovered = el;
  }

  function moveTo(x, y) {
    const el = elementAt(x, y);
    if (!el) {
      setHovered(null, x, y);
      return null;
    }
    setHovered(el, x, y);
    fire(el, 'pointermove', x, y);
    fire(el, 'mousemove', x, y);
    return el;
  }

  function clickAt(x, y) {
    const el = elementAt(x, y);
    if (!el) return;
    setHovered(el, x, y);

    const down = { button: 0, buttons: 1, detail: 1 };
    const up = { button: 0, buttons: 0, detail: 1 };

    fire(el, 'pointerdown', x, y, down);
    fire(el, 'mousedown', x, y, down);

    const focusTarget = el.closest(CLICKABLE);
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }

    fire(el, 'pointerup', x, y, up);
    fire(el, 'mouseup', x, y, up);
    fire(el, 'click', x, y, up);
  }

  function scrollAt(x, y, deltaY) {
    const el = elementAt(x, y);
    if (!el) return;

    const wheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      deltaY,
      deltaMode: 0,
    });
    el.dispatchEvent(wheel);

    // The app's own wheel handler calls preventDefault() when it decides to
    // run a page transition. Deferring to that flag lets this module follow
    // the app's decision without duplicating the logic behind it.
    if (wheel.defaultPrevented) return;

    // Synthetic events never trigger the browser's native scrolling, so the
    // in-page case has to be applied by hand.
    const scroller = findScrollable(el);
    if (scroller) scroller.scrollTop += deltaY;
  }

  function isClickable(el) {
    return Boolean(el && el.closest(CLICKABLE));
  }

  function clear() {
    if (hovered) {
      hovered.removeAttribute('data-gesture-hover');
      hovered = null;
    }
  }

  return { moveTo, clickAt, scrollAt, isClickable, clear };
}
