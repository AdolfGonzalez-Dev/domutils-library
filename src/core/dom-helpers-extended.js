// src/core/dom-helpers-extended.js
// DOM helpers: append/prepend/before/after, css, position/offset, clone
import { isNode } from '../utils/type.js';
import { vhToPx } from '../utils/dom-helpers.js';

/**
 * Normalize content: accepts Element, HTML string, DOMUtilsCore-like, DocumentFragment
 *
 * Important security note:
 * - By default strings are treated as plain text (safe).
 * - To insert HTML you MUST pass { html: true } or provide a sanitizeFn option.
 *   Example: append(parent, '<b>bold</b>', { html: true, sanitizeFn: sanitize })
 */
function normalizeContent(content, options = {}) {
  const { html = false, sanitizeFn = null } = options;

  if (!content && content !== 0) return null;

  // Strings: by default create a text node (safe)
  if (typeof content === 'string') {
    if (!html) {
      return document.createTextNode(content);
    }
    // html === true: optionally sanitize then parse
    const htmlStr = typeof sanitizeFn === 'function' ? sanitizeFn(content) : content;
    const tpl = document.createElement('template');
    tpl.innerHTML = String(htmlStr).trim();
    return tpl.content;
  }

  if (content instanceof DocumentFragment) return content;
  if (isNode(content)) return content;

  if (Array.isArray(content)) {
    const frag = document.createDocumentFragment();
    content.forEach(c => {
      const n = normalizeContent(c, options);
      if (n instanceof Node) frag.appendChild(n);
      else if (n) {
        // if it's a DocumentFragment, append its children
        if (n.cloneNode) frag.appendChild(n.cloneNode(true));
      }
    });
    return frag;
  }

  // DOMUtilsCore-like (has toArray)
  if (content && typeof content.toArray === 'function') {
    const frag = document.createDocumentFragment();
    content.toArray().forEach(n => {
      const node = normalizeContent(n, options);
      if (node instanceof Node) frag.appendChild(node);
      else if (node && node.cloneNode) frag.appendChild(node.cloneNode(true));
    });
    return frag;
  }
  return null;
}

export function append(parent, content, options = {}) {
  if (!parent) return null;
  const node = normalizeContent(content, options);
  if (!node) return null;
  parent.appendChild(node);
  return parent;
}

export function prepend(parent, content, options = {}) {
  if (!parent) return null;
  const node = normalizeContent(content, options);
  if (!node) return null;
  parent.insertBefore(node, parent.firstChild);
  return parent;
}

export function before(target, content, options = {}) {
  if (!target || !target.parentNode) return null;
  const node = normalizeContent(content, options);
  if (!node) return null;
  target.parentNode.insertBefore(node, target);
  return target;
}

export function after(target, content, options = {}) {
  if (!target || !target.parentNode) return null;
  const node = normalizeContent(content, options);
  if (!node) return null;
  target.parentNode.insertBefore(node, target.nextSibling);
  return target;
}

/**
 * css(el, propOrObj, value)
 * - css(el, 'color') -> returns computed value
 * - css(el, 'color', 'red') -> sets
 * - css(el, { color: 'red', display: 'block' })
 */
export function css(el, propOrObj, value) {
  if (!el || !el.style) return null;
  if (typeof propOrObj === 'string' && value === undefined) {
    return getComputedStyle(el).getPropertyValue(propOrObj);
  }
  if (typeof propOrObj === 'string') {
    el.style[propOrObj] = value == null ? '' : value;
    return el;
  }
  if (typeof propOrObj === 'object') {
    Object.entries(propOrObj).forEach(([k, v]) => {
      el.style[k] = v == null ? '' : v;
    });
    return el;
  }
  return el;
}

/**
 * position(el) -> position relative to offsetParent (left/top) and width/height
 * offset(el) -> position relative to document (page), includes scroll
 */
export function position(el) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const parent = el.offsetParent || document.documentElement;
  const parentRect = parent.getBoundingClientRect();
  return {
    left: rect.left - parentRect.left,
    top: rect.top - parentRect.top,
    width: rect.width,
    height: rect.height
  };
}

export function offset(el) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset,
    width: rect.width,
    height: rect.height
  };
}

/**
 * clone(el, { deep: true, copyId: false })
 */
export function clone(el, options = {}) {
  if (!el) return null;
  const { deep = true, copyId = false } = options;
  const c = el.cloneNode(deep);
  if (!copyId && c.removeAttribute) c.removeAttribute('id');
  // copy data-* explicitly (helpful for components)
  try {
    const srcDataset = el.dataset;
    if (srcDataset) {
      Object.keys(srcDataset).forEach(k => {
        c.dataset[k] = srcDataset[k];
      });
    }
  } catch (_) {}
  return c;
}

export default {
  append,
  prepend,
  before,
  after,
  css,
  position,
  offset,
  clone
};
