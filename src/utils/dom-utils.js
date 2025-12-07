// src/utils/dom-utils.js
// Small DOM convenience helpers (class / visibility / focus helpers)
// Defensive: guard against null/undefined elements and missing APIs.

export const addClass = (el, name) => {
  if (!el || !name) return el;
  try {
    if (el.classList && typeof el.classList.add === 'function') el.classList.add(name);
    else if (el.setAttribute) {
      // fallback: manually set class attribute
      const cls = (el.getAttribute && el.getAttribute('class')) || '';
      const classes = new Set(cls.split(/\s+/).filter(Boolean));
      classes.add(name);
      el.setAttribute('class', Array.from(classes).join(' '));
    }
  } catch (_) {}
  return el;
};

export const removeClass = (el, name) => {
  if (!el || !name) return el;
  try {
    if (el.classList && typeof el.classList.remove === 'function') el.classList.remove(name);
    else if (el.setAttribute) {
      const cls = (el.getAttribute && el.getAttribute('class')) || '';
      const classes = cls.split(/\s+/).filter(Boolean).filter(c => c !== name);
      el.setAttribute('class', classes.join(' '));
    }
  } catch (_) {}
  return el;
};

export const toggleClass = (el, name, force) => {
  if (!el || !name) return el;
  try {
    if (el.classList && typeof el.classList.toggle === 'function') {
      if (typeof force === 'boolean') el.classList.toggle(name, force);
      else el.classList.toggle(name);
    } else if (el.setAttribute) {
      const cls = (el.getAttribute && el.getAttribute('class')) || '';
      const classes = new Set(cls.split(/\s+/).filter(Boolean));
      if (typeof force === 'boolean') {
        if (force) classes.add(name);
        else classes.delete(name);
      } else {
        if (classes.has(name)) classes.delete(name);
        else classes.add(name);
      }
      el.setAttribute('class', Array.from(classes).join(' '));
    }
  } catch (_) {}
  return el;
};

export const show = (el) => {
  if (!el) return el;
  try {
    if (el.dataset && el.dataset.origDisplay) {
      el.style.display = el.dataset.origDisplay;
      delete el.dataset.origDisplay;
    } else {
      // attempt to clear inline display; fallback to block if computed shows none
      el.style.display = '';
      try {
        const cs = (typeof getComputedStyle === 'function') ? getComputedStyle(el).display : '';
        if (!cs || cs === 'none') el.style.display = 'block';
      } catch (_) {
        el.style.display = 'block';
      }
    }
    if ('hidden' in el) el.hidden = false;
  } catch (_) {}
  return el;
};

export const hide = (el) => {
  if (!el) return el;
  try {
    if (el.dataset && !el.dataset.origDisplay) {
      try {
        const cs = (typeof getComputedStyle === 'function') ? getComputedStyle(el).display : '';
        el.dataset.origDisplay = cs === 'none' ? '' : cs;
      } catch (_) {
        el.dataset.origDisplay = '';
      }
    }
    el.style.display = 'none';
    if ('hidden' in el) el.hidden = true;
  } catch (_) {}
  return el;
};

export const isHidden = (el) => {
  if (!el) return true;
  try {
    return ((typeof getComputedStyle === 'function') && getComputedStyle(el).display === 'none') || el.hidden === true;
  } catch (_) { return true; }
};

export default {
  addClass,
  removeClass,
  toggleClass,
  show,
  hide,
  isHidden
};