export function onMutation(target, callback, options = { childList: true, subtree: true, attributes: false }) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('onMutation: target not found');

  const mo = new MutationObserver((mutations, observer) => {
    try { callback(mutations, observer); } catch (err) { console.error(err); }
  });

  mo.observe(el, options);

  return {
    observer: mo,
    disconnect: () => mo.disconnect(),
    destroy: () => mo.disconnect()
  };
}