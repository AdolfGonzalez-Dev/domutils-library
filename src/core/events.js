// Robust event helpers for library consumption.

const elementHandlers = new WeakMap();

function normalizeEvents(events) {
  if (!events) return [];
  if (Array.isArray(events)) return events;
  return String(events).split(/\s+/).filter(Boolean);
}

function storeHandler(el, record) {
  if (!elementHandlers.has(el)) elementHandlers.set(el, []);
  elementHandlers.get(el).push(record);
}

function removeStoredHandlers(el, predicate) {
  const arr = elementHandlers.get(el) || [];
  const keep = arr.filter((r) => !predicate(r));
  if (keep.length) elementHandlers.set(el, keep);
  else elementHandlers.delete(el);
}

export function on(el, events, handler, options) {
  if (!el || typeof handler !== 'function') return () => {};
  const evs = normalizeEvents(events);
  evs.forEach((ev) => {
    const wrapped = handler;
    el.addEventListener(ev, wrapped, options);
    storeHandler(el, { ev, orig: handler, wrapped, options });
  });
  return () => off(el, events, handler);
}

export function off(el, events, handler) {
  if (!el) return;
  const stored = elementHandlers.get(el) || [];
  const evs = events ? normalizeEvents(events) : null;

  stored.forEach((rec) => {
    const matchEvent = !evs || evs.includes(rec.ev);
    const matchHandler = !handler || rec.orig === handler;
    if (matchEvent && matchHandler) {
      try { el.removeEventListener(rec.ev, rec.wrapped, rec.options); } catch (_) {}
    }
  });

  if (evs || handler) {
    removeStoredHandlers(el, (rec) => {
      const matchEvent = !evs || evs.includes(rec.ev);
      const matchHandler = !handler || rec.orig === handler;
      return matchEvent && matchHandler;
    });
  } else {
    try { (stored || []).forEach((rec) => el.removeEventListener(rec.ev, rec.wrapped, rec.options)); } catch (_) {}
    elementHandlers.delete(el);
  }
}

export function once(el, events, handler, options) {
  if (!el || typeof handler !== 'function') return () => {};
  const evs = normalizeEvents(events);
  const offFns = [];

  evs.forEach((ev) => {
    const wrapped = function (e) {
      try { handler.call(this, e); } finally { off(el, ev, handler); }
    };
    el.addEventListener(ev, wrapped, options);
    storeHandler(el, { ev, orig: handler, wrapped, options });
    offFns.push(() => off(el, ev, handler));
  });

  return () => offFns.forEach((f) => f());
}

export function delegate(root, selector, events, handler, options) {
  if (!root || !selector || typeof handler !== 'function') return () => {};
  const evs = normalizeEvents(events);

  evs.forEach((ev) => {
    const wrapped = function (e) {
      const base = e.target && e.target.closest ? e.target : e.target && e.target.parentElement ? e.target.parentElement : null;
      if (!base || !base.closest) return;
      const match = base.closest(selector);
      if (match && root.contains(match)) {
        handler.call(match, e, match);
      }
    };
    root.addEventListener(ev, wrapped, options);
    storeHandler(root, { ev, orig: handler, wrapped, options, delegated: true, selector });
  });

  return () => {
    off(root, events, handler);
  };
}

export function trigger(el, name, detail = {}, options = {}) {
  if (!el || !name) return null;
  const evt = new CustomEvent(name, Object.assign({ detail, bubbles: true, cancelable: true }, options));
  try { el.dispatchEvent(evt); } catch (err) { console.error('trigger error', err); }
  return evt;
}

export function addPassive(el, events, handler, opts = { passive: true }) {
  return on(el, events, handler, opts);
}

export default {
  on,
  off,
  once,
  delegate,
  trigger,
  addPassive
};