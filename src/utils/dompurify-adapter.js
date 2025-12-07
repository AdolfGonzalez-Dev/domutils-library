// src/utils/dompurify-adapter.js
// Adapter to create a sanitizeFn using DOMPurify if available. This file DOES NOT add dompurify as dependency;
// it attempts to dynamically import it (user must install dompurify to use this adapter).
//
// Usage:
//   // async:
//   const createSanitizerModule = await import('./utils/dompurify-adapter.js');
//   const sanitizeFn = await createSanitizerModule.createSanitizer(window);
//   append(parent, html, { html: true, sanitizeFn });
//
// Or, if DOMPurify is loaded globally as window.DOMPurify, createSanitizer will use it synchronously.

export async function createSanitizer(globalWindow = (typeof window !== 'undefined' ? window : undefined)) {
  if (!globalWindow) throw new Error('createSanitizer requires a window-like global (browser environment).');

  // If DOMPurify already present globally (e.g., loaded via <script>), use it
  if (globalWindow.DOMPurify && typeof globalWindow.DOMPurify.sanitize === 'function') {
    const DOMPurify = globalWindow.DOMPurify;
    return (s) => DOMPurify.sanitize(s);
  }

  // Try dynamic import of dompurify (user must have installed it)
  try {
    const mod = await import('dompurify');
    // dompurify default export is a factory that accepts window
    const createDOMPurify = mod.default || mod;
    const DOMPurify = createDOMPurify(globalWindow);
    return (s) => DOMPurify.sanitize(s);
  } catch (err) {
    throw new Error('DOMPurify not available. Install "dompurify" or provide your own sanitizeFn.');
  }
}

/**
 * Synchronous fallback: if DOMPurify is loaded on window, return sync sanitizer; otherwise returns passthrough.
 */
export function createSanitizerSync(globalWindow = (typeof window !== 'undefined' ? window : undefined)) {
  if (!globalWindow) return (s) => s;
  if (globalWindow.DOMPurify && typeof globalWindow.DOMPurify.sanitize === 'function') {
    return (s) => globalWindow.DOMPurify.sanitize(s);
  }
  // No DOMPurify available; return passthrough (caller should avoid using in untrusted contexts)
  return (s) => s;
}

export default {
  createSanitizer,
  createSanitizerSync
};
