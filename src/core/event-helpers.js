// Event helpers: clickOutside and longPress (plus delegation exists in core/events.js)

import { on, off } from './events.js';

/**
 * clickOutside(element, handler, options)
 * options: { exclude: [] (selectors or elements), capture: true/false }
 * returns unbind()
 */
export function clickOutside(element, handler, options = {}) {
  if (!element || typeof handler !== 'function') return () => {};
  const { exclude = [], capture = true } = options;

  function isExcluded(target) {
    for (const ex of exclude) {
      if (!ex) continue;
      if (typeof ex === 'string') {
        if (target.closest && target.closest(ex)) return true;
      } else if (ex instanceof Element) {
        if (ex.contains && ex.contains(target)) return true;
      }
    }
    return false;
  }

  function onDocClick(e) {
    const target = e.target;
    if (element.contains(target) || isExcluded(target)) return;
    handler.call(element, e);
  }

  document.addEventListener('click', onDocClick, capture);
  return () => document.removeEventListener('click', onDocClick, capture);
}

/**
 * longPress(element, handler, options)
 * options: { delay: 500, threshold: 10 } (ms and movement threshold in px)
 * returns unbind()
 */
export function longPress(element, handler, options = {}) {
  if (!element || typeof handler !== 'function') return () => {};
  const { delay = 600, threshold = 8 } = options;
  let timer = null;
  let startX = 0;
  let startY = 0;
  let moved = false;

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
    moved = false;
  }

  function onStart(e) {
    const p = (e.touches && e.touches[0]) || e;
    startX = p.clientX;
    startY = p.clientY;
    moved = false;
    timer = setTimeout(() => {
      if (!moved) handler.call(element, e);
    }, delay);
  }

  function onMove(e) {
    const p = (e.touches && e.touches[0]) || e;
    const dx = Math.abs(p.clientX - startX);
    const dy = Math.abs(p.clientY - startY);
    if (dx > threshold || dy > threshold) {
      moved = true;
      cancel();
    }
  }

  function onEnd() { cancel(); }

  element.addEventListener('mousedown', onStart);
  element.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);

  return () => {
    element.removeEventListener('mousedown', onStart);
    element.removeEventListener('touchstart', onStart);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchend', onEnd);
    cancel();
  };
}

export default {
  clickOutside,
  longPress
};