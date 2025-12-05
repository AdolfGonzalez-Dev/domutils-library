export function getAttribute(el, name) {
  if (!el || !name || !el.getAttribute) return null;
  return el.getAttribute(name);
}

export function setAttribute(el, name, value) {
  if (!el || !name || !el.setAttribute) return;
  if (value === false) {
    try { el.removeAttribute(name); } catch (_) {}
    return;
  }
  if (value === null || value === undefined) return;
  if (value === true) return el.setAttribute(name, '');
  el.setAttribute(name, String(value));
}

export function setAttributes(el, attrs = {}) {
  if (!el || !attrs || typeof attrs !== 'object') return;
  Object.entries(attrs).forEach(([k, v]) => setAttribute(el, k, v));
}

export function removeAttribute(el, name) {
  if (!el || !name || !el.removeAttribute) return;
  try { el.removeAttribute(name); } catch (_) {}
}

export function toggleAttribute(el, name, force) {
  if (!el || !name) return false;
  if (typeof force === 'boolean') {
    if (force) setAttribute(el, name, true);
    else removeAttribute(el, name);
    return !!force;
  }
  if (el.hasAttribute && el.hasAttribute(name)) {
    removeAttribute(el, name);
    return false;
  }
  setAttribute(el, name, true);
  return true;
}

export function hasAttribute(el, name) {
  if (!el || !name || !el.hasAttribute) return false;
  return el.hasAttribute(name);
}

export function getData(el, key) {
  if (!el || !el.dataset) return undefined;
  return el.dataset ? el.dataset[key] : undefined;
}
export function setData(el, key, value) {
  if (!el || !el.dataset) return;
  if (value === undefined || value === null) return;
  el.dataset[key] = String(value);
}
export function removeData(el, key) {
  if (!el || !el.dataset) return;
  delete el.dataset[key];
}

export default {
  getAttribute,
  setAttribute,
  setAttributes,
  removeAttribute,
  toggleAttribute,
  hasAttribute,
  getData,
  setData,
  removeData
};