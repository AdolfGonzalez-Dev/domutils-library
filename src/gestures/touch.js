export const getPoint = (e) => {
  if (!e) return { x: 0, y: 0 };
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX ?? 0, y: e.clientY ?? 0 };
};
export const getX = (e) => getPoint(e).x;
export const getY = (e) => getPoint(e).y;

export function addPointerDown(target, handler, options) {
  if (window.PointerEvent) {
    target.addEventListener('pointerdown', handler, options);
    return () => target.removeEventListener('pointerdown', handler, options);
  } else {
    target.addEventListener('touchstart', handler, options);
    target.addEventListener('mousedown', handler, options);
    return () => {
      target.removeEventListener('touchstart', handler, options);
      target.removeEventListener('mousedown', handler, options);
    };
  }
}