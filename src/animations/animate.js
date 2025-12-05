// Animations helpers: animate (Web Animations API fallback) + fadeIn/fadeOut helpers

/**
 * animate(el, keyframes, options)
 * - uses Element.animate if available, otherwise applies CSS transition fallback
 * returns a Promise that resolves when finished and also the Animation instance for cancellation (when available)
 */
export function animate(el, keyframes, options = {}) {
  if (!el) return Promise.reject(new Error('animate: element required'));
  const opts = Object.assign({ duration: 300, easing: 'ease', fill: 'forwards' }, options);

  if (el.animate) {
    const anim = el.animate(keyframes, opts);
    return new Promise((resolve, reject) => {
      anim.onfinish = () => resolve(anim);
      anim.oncancel = () => reject(new Error('animation cancelled'));
    });
  } else {
    // Fallback: simple transition using CSS
    return new Promise((resolve) => {
      const style = el.style;
      const from = keyframes[0] || {};
      const to = keyframes[keyframes.length - 1] || {};
      // apply initial
      Object.entries(from).forEach(([k, v]) => { style[k] = v; });
      // force reflow
      void el.offsetWidth;
      style.transition = `all ${opts.duration}ms ${opts.easing}`;
      Object.entries(to).forEach(([k, v]) => { style[k] = v; });
      const cleanup = () => {
        style.transition = '';
        resolve();
      };
      setTimeout(cleanup, opts.duration + 20);
    });
  }
}

/**
 * fadeIn(el, duration)
 * fadeOut(el, duration)
 * returns Promise
 */
export function fadeIn(el, duration = 300) {
  if (!el) return Promise.resolve();
  el.style.opacity = 0;
  el.style.display = el.dataset.origDisplay || getComputedStyle(el).display || 'block';
  return animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration }).then(() => {
    el.style.opacity = '';
    return el;
  });
}

export function fadeOut(el, duration = 300) {
  if (!el) return Promise.resolve();
  if (!el.dataset.origDisplay) {
    const cs = getComputedStyle(el).display;
    el.dataset.origDisplay = cs === 'none' ? 'block' : cs;
  }
  return animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration }).then(() => {
    el.style.opacity = '';
    el.style.display = 'none';
    return el;
  });
}

export default {
  animate,
  fadeIn,
  fadeOut
};