export function onVisible(target, callback, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('onVisible: target not found');

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        try { callback(entry, observer); } catch (err) { console.error(err); }
      }
    });
  }, options);

  obs.observe(el);

  return {
    observer: obs,
    disconnect: () => obs.unobserve(el),
    destroy: () => obs.disconnect()
  };
}