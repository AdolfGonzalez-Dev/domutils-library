import { getPoint } from './touch.js';

export function createDragController(target, options = {}) {
  const listeners = { start: [], move: [], end: [] };
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('createDragController: target not found');

  const cfg = Object.assign({ axis: null, bounds: null, useTransform: true, auto: true }, options);
  let active = false;
  let startPointer = null;
  let startRect = null;
  let pointerId = null;

  function emit(name, payload) {
    (listeners[name] || []).forEach(fn => { try { fn(payload); } catch (e) { console.error(e); } });
    if (typeof cfg['on' + name[0].toUpperCase() + name.slice(1)] === 'function') {
      try { cfg['on' + name[0].toUpperCase() + name.slice(1)](payload); } catch (e) { console.error(e); }
    }
  }

  function onDown(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    active = true;
    startPointer = getPoint(e);
    startRect = el.getBoundingClientRect();
    pointerId = e.pointerId ?? null;
    if (pointerId != null) el.setPointerCapture && el.setPointerCapture(pointerId);
    emit('start', { el, originalEvent: e, startPointer, startRect });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.userSelect = 'none';
  }

  function onMove(e) {
    if (!active) return;
    if (pointerId != null && e.pointerId != null && e.pointerId !== pointerId) return;
    const pt = getPoint(e);
    const dx = pt.x - startPointer.x;
    const dy = pt.y - startPointer.y;
    let newX = startRect.left + dx;
    let newY = startRect.top + dy;
    if (cfg.axis === 'x') newY = startRect.top;
    if (cfg.axis === 'y') newX = startRect.left;
    emit('move', { el, originalEvent: e, dx, dy, newX, newY });
    if (cfg.useTransform) {
      const tx = newX - startRect.left;
      const ty = newY - startRect.top;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    } else {
      el.style.position = el.style.position || 'absolute';
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }
  }

  function onUp(e) {
    if (!active) return;
    active = false;
    try { el.releasePointerCapture && el.releasePointerCapture(e.pointerId); } catch (_) {}
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    document.body.style.userSelect = '';
    emit('end', { el, originalEvent: e });
  }

  function enable() {
    el.addEventListener('pointerdown', onDown, { passive: true });
    el.addEventListener('mousedown', onDown, { passive: true });
    return controller;
  }

  function disable() {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('mousedown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    return controller;
  }

  function on(eventName, fn) {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(fn);
    return () => {
      const idx = listeners[eventName].indexOf(fn);
      if (idx >= 0) listeners[eventName].splice(idx, 1);
    };
  }

  const controller = { enable, disable, on, destroy: disable };
  if (cfg.auto) enable();
  return controller;
}