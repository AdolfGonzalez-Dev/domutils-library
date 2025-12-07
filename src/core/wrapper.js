import { isString, isNode, isNodeList } from '../utils/type.js';
import { on, off, delegate, once as onceEvent } from './events.js';

/**
 * normalizeInput - same semantics as before
 */
function normalizeInput(selectorOrNode) {
  if (!selectorOrNode) return [];
  if (isNode(selectorOrNode)) return [selectorOrNode];
  if (isNodeList(selectorOrNode)) return Array.from(selectorOrNode);
  if (Array.isArray(selectorOrNode)) return selectorOrNode.slice();
  if (isString(selectorOrNode)) {
    try { return Array.from(document.querySelectorAll(selectorOrNode)); }
    catch (e) { console.warn('Invalid selector', selectorOrNode); return []; }
  }
  return [];
}

export default class DOMUtilsCore {
  constructor(selectorOrNode) {
    this.nodes = normalizeInput(selectorOrNode);
  }

  get length() { return this.nodes.length; }
  toArray() { return this.nodes.slice(); }
  get(index = 0) { return this.nodes[index]; }
  eq(index) { return new DOMUtilsCore(this.get(index)); }

  find(selector) {
    const found = this.nodes.reduce((acc, n) => {
      if (!n) return acc;
      acc.push(...Array.from(n.querySelectorAll(selector)));
      return acc;
    }, []);
    return new DOMUtilsCore(found);
  }

  each(fn) { this.nodes.forEach((n, i) => fn.call(n, n, i)); return this; }
  map(fn) { return this.nodes.map((n, i) => fn.call(n, n, i)); }

  // -----------------------
  // Event helpers (wrapper)
  // -----------------------
  /**
   * on(events, selector?, handler?, options?)
   * - if selectorOrHandler is a string, uses delegation
   * - if function passed directly, attaches direct listener
   */
  on(events, selectorOrHandler, handler, options) {
    if (!events) return this;
    // direct attach: on(events, handler, options)
    if (typeof selectorOrHandler === 'function' || selectorOrHandler == null) {
      const fn = selectorOrHandler;
      this.each((el) => on(el, events, fn, options));
    } else {
      // delegated: on(events, selector, handler, options)
      const selector = selectorOrHandler;
      const fn = handler;
      this.each((el) => delegate(el, selector, events, fn, options));
    }
    return this;
  }

  /**
   * off(events, selectorOrHandler?, handler?)
   * - Mirrors .on removal semantics. If selector string provided, removes delegated handler by orig handler.
   */
  off(events, selectorOrHandler, handler) {
    if (!events) return this;
    // off(events, handler)
    if (typeof selectorOrHandler === 'function' || selectorOrHandler == null) {
      const fn = selectorOrHandler;
      this.each((el) => off(el, events, fn));
    } else {
      // off(events, selector, handler) -> remove by handler (delegate stores orig handler)
      const selector = selectorOrHandler;
      const fn = handler;
      // Removing delegated listeners: our core `delegate` stored `orig` (handler) so off will remove by orig.
      this.each((el) => off(el, events, fn));
    }
    return this;
  }

  /**
   * once(events, handler, options)
   */
  once(events, handler, options) {
    if (!events || typeof handler !== 'function') return this;
    this.each((el) => onceEvent(el, events, handler, options));
    return this;
  }

  // -----------------------
  // Class / Visibility helpers
  // -----------------------
  addClass(name) {
    if (!name) return this;
    this.each((el) => { try { el.classList.add(name); } catch (_) {} });
    return this;
  }

  removeClass(name) {
    if (!name) return this;
    this.each((el) => { try { el.classList.remove(name); } catch (_) {} });
    return this;
  }

  toggleClass(name, force) {
    if (!name) return this;
    this.each((el) => {
      try { 
        if (typeof force === 'boolean') el.classList.toggle(name, force);
        else el.classList.toggle(name);
      } catch (_) {}
    });
    return this;
  }

  // show/hide simple helpers (store previous display in dataset.origDisplay)
  show() {
    this.each((el) => {
      try {
        if (el.dataset && el.dataset.origDisplay) {
          el.style.display = el.dataset.origDisplay;
          delete el.dataset.origDisplay;
        } else {
          el.style.display = '';
          // if computed style still none, try block as default
          const cs = getComputedStyle(el).display;
          if (cs === 'none') el.style.display = 'block';
        }
        el.hidden = false;
      } catch (_) {}
    });
    return this;
  }

  hide() {
    this.each((el) => {
      try {
        // store previous computed display if not stored
        if (el.dataset && !el.dataset.origDisplay) {
          const cs = getComputedStyle(el).display;
          el.dataset.origDisplay = cs === 'none' ? '' : cs;
        }
        el.style.display = 'none';
        el.hidden = true;
      } catch (_) {}
    });
    return this;
  }

  isHidden() {
    const el = this.get(0);
    if (!el) return true;
    try {
      return getComputedStyle(el).display === 'none' || el.hidden === true;
    } catch (_) { return true; }
  }
}
