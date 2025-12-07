export function onResize(target, callback, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('onResize: target not found');

  const ro = new ResizeObserver((entries) => {
    entries.forEach(entry => {
      const rect = entry.contentRect || el.getBoundingClientRect();
      try { callback(rect, entry); } catch (err) { console.error(err); }
    });
  });

  ro.observe(el, options);

  return {
    observer: ro,
    disconnect: () => ro.unobserve(el),
    destroy: () => ro.disconnect()
  };
}