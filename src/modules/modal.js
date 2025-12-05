// src/modules/modal.js
// Improved Modal component with options, overlay handling, destroy/unbind and accessibility (focus trap + restore)

export class Modal {
  constructor(selectorOrElement, options = {}) {
    this.el = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement;
    if (!this.el) throw new Error('Modal: target element not found');

    this.opts = Object.assign({
      overlaySelector: '.modal-overlay',
      closeSelector: '[data-modal-close]',
      openClass: 'open',
      closeOnOverlay: true,
      closeOnEsc: true,
      onShow: null,
      onHide: null,
      focusFirst: true
    }, options);

    this.overlay = this.el.querySelector(this.opts.overlaySelector) || null;
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = this.opts.overlaySelector.replace(/^\./, '') || 'modal-overlay';
      this.el.insertBefore(this.overlay, this.el.firstChild);
      this._overlayCreated = true;
    } else {
      this._overlayCreated = false;
    }

    this._listeners = [];
    this._isOpen = false;
    this._previousActiveElement = null;
    this._backgroundHiddenNodes = [];

    this._onOverlayClick = (e) => { if (this.opts.closeOnOverlay) this.hide(); };
    this._onCloseClick = (e) => { this.hide(); };
    this._onWindowKeyDown = (e) => { if (this.opts.closeOnEsc && e.key === 'Escape') this.hide(); };
    this._onTrapKeyDown = this._trapKeyDown.bind(this);
    this._delegateClose = (e) => {
      const closeBtn = e.target.closest ? e.target.closest(this.opts.closeSelector) : null;
      if (closeBtn && this.el.contains(closeBtn)) {
        e.preventDefault();
        this.hide();
      }
    };

    this._init();
  }

  _init() {
    try {
      this.overlay.addEventListener('click', this._onOverlayClick);
      this._listeners.push({ el: this.overlay, type: 'click', fn: this._onOverlayClick });
    } catch (_) {}

    this.el.addEventListener('click', this._delegateClose);
    this._listeners.push({ el: this.el, type: 'click', fn: this._delegateClose });

    if (!this.el.hasAttribute('role')) this.el.setAttribute('role', 'dialog');
    if (!this.el.hasAttribute('aria-modal')) this.el.setAttribute('aria-modal', 'false');
    if (!this.el.hasAttribute('tabindex')) this.el.setAttribute('tabindex', '-1');
  }

  _getFocusableElements() {
    if (!this.el) return [];
    const selectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ];
    const candidates = Array.from(this.el.querySelectorAll(selectors.join(',')));
    if (candidates.length === 0) return [];

    let hasLayout = false;
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      try {
        if (el.offsetWidth || el.offsetHeight) { hasLayout = true; break; }
        const rects = el.getClientRects && el.getClientRects();
        if (rects && rects.length) { hasLayout = true; break; }
      } catch (_) {}
    }

    if (hasLayout) {
      return candidates.filter(el => {
        try {
          return el.offsetWidth || el.offsetHeight || (el.getClientRects && el.getClientRects().length);
        } catch (_) {
          return false;
        }
      });
    }
    return candidates;
  }

  _trapKeyDown(e) {
    if (e.key !== 'Tab') return;
    const focusable = this._getFocusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      try { this.el.focus(); } catch (_) {}
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === this.el) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  _hideBackground() {
    const bodyChildren = Array.from(document.body.children || []);
    this._backgroundHiddenNodes = [];
    bodyChildren.forEach((node) => {
      if (node === this.el || node.contains(this.el)) return;
      try {
        const prev = node.getAttribute && node.getAttribute('aria-hidden');
        this._backgroundHiddenNodes.push({ node, prev });
        node.setAttribute('aria-hidden', 'true');
      } catch (_) {}
    });
  }

  _restoreBackground() {
    (this._backgroundHiddenNodes || []).forEach(({ node, prev }) => {
      try {
        if (prev === null || prev === undefined) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', prev);
      } catch (_) {}
    });
    this._backgroundHiddenNodes = [];
  }

  show() {
    if (this._isOpen) return this;

    try { this._previousActiveElement = document.activeElement; } catch (_) { this._previousActiveElement = null; }

    this.el.classList.add(this.opts.openClass);
    this.el.setAttribute('aria-modal', 'true');
    this._isOpen = true;

    this._hideBackground();

    this.el.addEventListener('keydown', this._onTrapKeyDown);
    this._listeners.push({ el: this.el, type: 'keydown', fn: this._onTrapKeyDown });

    if (this.opts.closeOnEsc) {
      window.addEventListener('keydown', this._onWindowKeyDown);
      this._listeners.push({ el: window, type: 'keydown', fn: this._onWindowKeyDown });
    }

    if (this.opts.focusFirst) {
      try {
        const focusable = this._getFocusableElements();
        if (focusable.length) {
          const target = focusable[0];
          try { if (typeof target.focus === 'function') target.focus(); } catch (_) {}
          if (document.activeElement !== target) {
            try { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '0'); target.focus(); } catch (_) {}
          }
          if (document.activeElement !== target) {
            Promise.resolve().then(() => { try { target.focus(); } catch (_) {} });
          }
        } else {
          try { this.el.focus(); } catch (_) {}
        }
      } catch (_) {
        try { this.el.focus(); } catch (_) {}
      }
    }

    try { typeof this.opts.onShow === 'function' && this.opts.onShow.call(this, this.el); } catch (err) { console.error(err); }
    return this;
  }

    hide() {
    if (!this._isOpen) return this;

    this.el.classList.remove(this.opts.openClass);
    this.el.setAttribute('aria-modal', 'false');
    this._isOpen = false;

    try { this.el.removeEventListener('keydown', this._onTrapKeyDown); } catch (_) {}
    try { window.removeEventListener('keydown', this._onWindowKeyDown); } catch (_) {}

    this._restoreBackground();

    // Robust focus restore: blur current active if it's not the previous, then attempt restore
    const prev = this._previousActiveElement;

    try {
      // If some other element remains focused, try to blur it first to allow prev.focus() to take effect.
      const active = (typeof document !== 'undefined') ? document.activeElement : null;
      if (active && prev && active !== prev) {
        try { if (typeof active.blur === 'function') active.blur(); } catch (_) {}
      }
    } catch (_) {}

    const doFocusAttempt = (attempt = 0) => {
      try {
        if (prev && typeof prev.focus === 'function') prev.focus();
      } catch (_) {}
      // If not focused and we haven't retried too many times, schedule another attempt
      if (prev && typeof document !== 'undefined' && document.activeElement !== prev && attempt < 3) {
        // microtask retry
        Promise.resolve().then(() => { doFocusAttempt(attempt + 1); });
        // macrotask fallback
        setTimeout(() => { doFocusAttempt(attempt + 1); }, 0);
      }
    };
    if (prev) doFocusAttempt(0);

    try {
      if (typeof this.opts.onHide === 'function') this.opts.onHide.call(this, this.el);
    } catch (err) { console.error(err); }

    // cleanup recorded listeners entries (we already removed DOM listeners)
    this._listeners = this._listeners.filter(l => !(l.el === window && l.type === 'keydown' && l.fn === this._onWindowKeyDown));
    this._listeners = this._listeners.filter(l => !(l.el === this.el && l.type === 'keydown' && l.fn === this._onTrapKeyDown));

    return this;
  }

  toggle() {
    return this._isOpen ? this.hide() : this.show();
  }

  destroy() {
    this._listeners.forEach(({ el, type, fn }) => {
      try { el.removeEventListener(type, fn); } catch (_) {}
    });
    this._listeners = [];
    this._restoreBackground();
    try { if (this._previousActiveElement && typeof this._previousActiveElement.focus === 'function') this._previousActiveElement.focus(); } catch (_) {}
    if (this._overlayCreated && this.overlay && this.overlay.parentNode === this.el) {
      this.el.removeChild(this.overlay);
    }
    this.el = null;
    this.overlay = null;
    this._previousActiveElement = null;
    this._backgroundHiddenNodes = null;
  }
}

export default Modal;