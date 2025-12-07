export const defer = (fn) => {
  if (typeof fn !== 'function') return Promise.resolve();
  return Promise.resolve().then(() => { try { return fn(); } catch (err) { setTimeout(() => { throw err; }); } });
};
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
export const wait = (ms = 0) => new Promise((r) => setTimeout(r, ms));
export function requestIdle(fn, timeout = 200) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback((deadline) => fn(deadline), { timeout });
    return () => cancelIdleCallback(id);
  } else {
    let cancelled = false;
    const id = setTimeout(() => { if (!cancelled) fn({ didTimeout: true, timeRemaining: () => 0 }); }, 0);
    return () => { cancelled = true; clearTimeout(id); };
  }
}