import { getPoint } from './touch.js';

export function onSwipe(element, callback, options = {}) {
  const { threshold = 40, maxTime = 500, allowedAngle = 30 } = options;
  let start = null;

  function down(e) {
    start = { t: Date.now(), p: getPoint(e) };
  }

  function up(e) {
    if (!start) return;
    const end = { t: Date.now(), p: getPoint(e) };
    const dt = end.t - start.t;
    const dx = end.p.x - start.p.x;
    const dy = end.p.y - start.p.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (dt > maxTime) { start = null; return; }

    if (Math.max(absX, absY) < threshold) { start = null; return; }

    const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
    let direction = null;
    if (absX >= absY && angle < (90 - allowedAngle)) {
      direction = dx > 0 ? 'right' : 'left';
    } else if (absY > absX && angle > (90 + allowedAngle)) {
      direction = dy > 0 ? 'down' : 'up';
    } else {
      direction = absX > absY ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    }

    callback({
      direction,
      distance: Math.max(absX, absY),
      deltaX: dx,
      deltaY: dy,
      duration: dt,
      start: start.p,
      end: end.p,
      originalEvent: e
    });

    start = null;
  }

  element.addEventListener('touchstart', down, { passive: true });
  element.addEventListener('touchend', up);
  element.addEventListener('mousedown', down);
  element.addEventListener('mouseup', up);

  return function off() {
    element.removeEventListener('touchstart', down);
    element.removeEventListener('touchend', up);
    element.removeEventListener('mousedown', down);
    element.removeEventListener('mouseup', up);
  };
}