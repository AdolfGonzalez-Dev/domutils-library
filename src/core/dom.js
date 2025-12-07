// Robust DOM helpers with flexible root resolution.

const SVG_NS = 'http://www.w3.org/2000/svg';

function isElement(obj) {
  return !!obj && typeof obj === 'object' && obj.nodeType === 1;
}

function isDocument(obj) {
  return !!obj && obj.nodeType === 9;
}

export function resolveRoot(root) {
  if (!root) return document;
  if (isDocument(root) || isElement(root)) return root;
  if (typeof root === 'string') {
    try {
      const found = document.querySelector(root);
      return found || null;
    } catch (err) {
      console.warn('resolveRoot: invalid selector', root, err);
      return null;
    }
  }
  return null;
}

export function find(rootOrSelector, maybeSelector) {
  if (maybeSelector === undefined) {
    if (!rootOrSelector) return null;
    try { return document.querySelector(rootOrSelector); }
    catch (err) { console.warn('find: invalid selector', rootOrSelector, err); return null; }
  }

  const root = resolveRoot(rootOrSelector) || document;
  if (!root || !maybeSelector) return null;
  try { return root.querySelector(maybeSelector); }
  catch (err) { console.warn('find: invalid selector', maybeSelector, err); return null; }
}

export function findAll(rootOrSelector, maybeSelector) {
  if (maybeSelector === undefined) {
    if (!rootOrSelector) return [];
    try { return Array.from(document.querySelectorAll(rootOrSelector)); }
    catch (err) { console.warn('findAll: invalid selector', rootOrSelector, err); return []; }
  }

  const root = resolveRoot(rootOrSelector) || document;
  if (!root || !maybeSelector) return [];
  try { return Array.from(root.querySelectorAll(maybeSelector)); }
  catch (err) { console.warn('findAll: invalid selector', maybeSelector, err); return []; }
}

export function create(tag, attrs = {}, options = {}) {
  const el = options.svg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
  if (attrs && typeof attrs === 'object') {
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    });
  }
  return el;
}

export function createScopedFinder(root) {
  return (selector) => {
    const r = resolveRoot(root) || document;
    if (!r || !selector) return null;
    try { return r.querySelector(selector); } catch (err) { console.warn('createScopedFinder: invalid selector', selector, err); return null; }
  };
}

export function createScopedAll(root) {
  return (selector) => {
    const r = resolveRoot(root) || document;
    if (!r || !selector) return [];
    try { return Array.from(r.querySelectorAll(selector)); } catch (err) { console.warn('createScopedAll: invalid selector', selector, err); return []; }
  };
}

const getBody = () => document.body || document.documentElement;

export const findInBody = (selector) => find(getBody(), selector);
export const findAllInBody = (selector) => findAll(getBody(), selector);

export const q = (selector) => find(selector);
export const qa = (selector) => findAll(selector);

export const DOM = (selector) => {
  if (!selector) return null;
  try { return document.querySelector(selector); } catch (err) { console.warn('DOM: invalid selector', selector, err); return null; }
};

export default {
  resolveRoot,
  find,
  findAll,
  create,
  createScopedFinder,
  createScopedAll,
  findInBody,
  findAllInBody,
  q,
  qa,
  DOM
};