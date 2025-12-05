// src/modules/tabs.js
// Tabs component with keyboard navigation and destroy/unbind

export class Tabs {
  /**
   * @param {string|Element} selectorOrElement - container selector or element
   * @param {Object} options - { tabSelector, panelSelector, activeClass, initial }
   */
  constructor(selectorOrElement, options = {}) {
    this.container = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement;
    if (!this.container) throw new Error('Tabs: container not found');

    this.opts = Object.assign({
      tabSelector: '[data-tab]',
      panelSelector: '[data-panel]',
      activeClass: 'active',
      initial: null, // id of initial tab
      useHash: false // update location.hash when selecting
    }, options);

    this._tabs = Array.from(this.container.querySelectorAll(this.opts.tabSelector));
    this._panels = Array.from(this.container.querySelectorAll(this.opts.panelSelector));
    this._clickHandler = this._onTabClick.bind(this);
    this._keyHandler = this._onKeyDown.bind(this);

    this._init();
  }

  _init() {
    this._tabs.forEach(tab => tab.setAttribute('role', 'tab'));
    this._panels.forEach(panel => panel.setAttribute('role', 'tabpanel'));

    this.container.addEventListener('click', this._clickHandler);
    this.container.addEventListener('keydown', this._keyHandler);

    // Determine initial active tab
    let initial = this.opts.initial;
    if (!initial && this.opts.useHash && location.hash) {
      initial = location.hash.replace(/^#/, '');
    }
    if (!initial && this._tabs.length) {
      initial = this._tabs[0].dataset.tab;
    }
    if (initial) this.select(initial, { setFocus: false });
  }

  _onTabClick(e) {
    const tabEl = e.target.closest ? e.target.closest(this.opts.tabSelector) : null;
    if (!tabEl || !this.container.contains(tabEl)) return;
    const id = tabEl.dataset.tab;
    if (!id) return;
    this.select(id, { setFocus: true });
  }

  _onKeyDown(e) {
    const target = e.target.closest ? e.target.closest(this.opts.tabSelector) : null;
    if (!target || !this.container.contains(target)) return;

    const idx = this._tabs.indexOf(target);
    if (idx < 0) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'Right':
        e.preventDefault();
        this._focusTab((idx + 1) % this._tabs.length);
        break;
      case 'ArrowLeft':
      case 'Left':
        e.preventDefault();
        this._focusTab((idx - 1 + this._tabs.length) % this._tabs.length);
        break;
      case 'Home':
        e.preventDefault();
        this._focusTab(0);
        break;
      case 'End':
        e.preventDefault();
        this._focusTab(this._tabs.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.select(target.dataset.tab);
        break;
      default:
        break;
    }
  }

  _focusTab(index) {
    const tab = this._tabs[index];
    if (!tab) return;
    tab.focus();
  }

  /**
   * Select a tab by id (data-tab value)
   * @param {string} id
   * @param {Object} opts - { setFocus: boolean }
   */
  select(id, opts = {}) {
    const { setFocus = true } = opts;
    if (!id) return;

    this._tabs.forEach(t => t.classList.toggle(this.opts.activeClass, t.dataset.tab === id));
    this._panels.forEach(p => p.classList.toggle(this.opts.activeClass, p.dataset.panel === id));

    if (this.opts.useHash) {
      try { history.replaceState(null, '', `#${id}`); } catch (_) {}
    }

    if (setFocus) {
      const activeTab = this._tabs.find(t => t.dataset.tab === id);
      activeTab && activeTab.focus();
    }
  }

  destroy() {
    this.container.removeEventListener('click', this._clickHandler);
    this.container.removeEventListener('keydown', this._keyHandler);
    this._tabs = null;
    this._panels = null;
    this.container = null;
  }
}

export default Tabs;