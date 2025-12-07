import { getPoint } from '../gestures/touch.js';
import { isNode } from './type.js';

export const q = (selector, root = document) => {
  if (!selector) return null;
  if (isNode(selector)) return selector;
  return root.querySelector(selector);
};
export const qa = (selector, root = document) => {
  if (!selector) return [];
  if (isNode(selector)) return [selector];
  return Array.from(root.querySelectorAll(selector));
};
export const posY = (e) => {
  const p = getPoint(e);
  if (e && e.touches && e.touches[0]) return e.touches[0].pageY || p.y;
  return p.y;
};
export default { q, qa, posY };