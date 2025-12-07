import { clamp as _clamp } from './math.js';

export const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
export const oneVhPx = () => window.innerHeight * 0.01;
export const vhToPx = (vh) => (vh / 100) * window.innerHeight;
export const pxToVh = (px) => (px / window.innerHeight) * 100;
export const clamp = (v, a, b) => _clamp(v, a, b);

export function setElementHeightVh(el, vh) {
  if (!el) return;
  const safe = clamp(Number(vh), 0, 100);
  const px = vhToPx(safe);
  el.style.height = `${px}px`;
  if (safe >= 100) el.classList.add('fullscreen');
  else el.classList.remove('fullscreen');
}

export function toggleBodyNoScroll(enable = true) {
  if (enable) document.body.classList.add('no-scroll');
  else document.body.classList.remove('no-scroll');
}

export function createOverlay({ className = 'overlay', appendTo = document.body } = {}) {
  const overlay = document.createElement('div');
  overlay.className = className;
  appendTo.appendChild(overlay);
  return overlay;
}

export function addPassiveListener(target, type, handler, opts = {}) {
  const usePassive = opts.passive === undefined ? true : !!opts.passive;
  target.addEventListener(type, handler, { passive: usePassive, capture: !!opts.capture });
  return () => target.removeEventListener(type, handler, { capture: !!opts.capture });
}