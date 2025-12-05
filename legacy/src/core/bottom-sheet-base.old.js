import { defer, nextFrame } from '../utils/async.js';
import { isMobile, setElementHeightVh, toggleBodyNoScroll, addPassiveListener, oneVhPx, clamp } from '../utils/dom-helpers.js';
import { createDragController } from '../gestures/drag.js';

export default class BottomSheetBase extends HTMLElement {
  constructor() {
    super();
    this.defaultVh = 0;
    this.beforeVh = 0;
    this.sheetHeight = 0;
    this.mobileVhPx = oneVhPx();
    this._overlay = null;
    this._sheetWrapper = null;
    this._offOverlay = null;
    this._dragController = null;
    this._onResize = null;
  }

  connectedCallback() {
    if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true');
    this._ensureStructure();
    this._bindOverlay();
    this._onResize = () => {
      this.mobileVhPx = oneVhPx();
      this.setSheetHeight(this.sheetHeight || this.defaultVh);
    };
    window.addEventListener('resize', this._onResize);
    if (isMobile()) this._bindDrag();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._onResize);
    if (this._offOverlay) this._offOverlay();
    this._destroyDrag();
    if (this._overlay && this._overlay.parentNode) this._overlay.parentNode.removeChild(this._overlay);
  }

  _ensureStructure() {
    if (!this.querySelector('.sheet__wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'sheet__wrapper';
      while (this.firstChild) wrapper.appendChild(this.firstChild);
      this.appendChild(wrapper);
    }
    this._sheetWrapper = this.querySelector('.sheet__wrapper');
    this.classList.add('customBottomsheet');
    if (!this._overlay) this._overlay = createOverlay({ appendTo: this });
  }

  _bindOverlay() {
    if (this._offOverlay) this._offOverlay();
    this._offOverlay = addPassiveListener(this._overlay, 'click', () => this.closeSheet(), { passive: true });
  }

  _bindDrag() {
    this._destroyDrag();
    try {
      this._dragController = createDragController(this._sheetWrapper, {
        axis: null,
        useTransform: true,
        onStart: () => { this._sheetWrapper.classList.add('not-selectable'); },
        onMove: (info) => {
          const rect = this._sheetWrapper.getBoundingClientRect();
          const visibleHeightPx = Math.max(0, window.innerHeight - rect.top);
          const vh = (visibleHeightPx / window.innerHeight) * 100;
          this.sheetHeight = clamp(vh, 0, 100);
          this._sheetWrapper.style.transition = 'none';
          setElementHeightVh(this._sheetWrapper, this.sheetHeight);
        },
        onEnd: () => {
          this._sheetWrapper.classList.remove('not-selectable');
          defer(() => {
            this._sheetWrapper.style.transition = '';
            if (this.sheetHeight < this.beforeVh - 5) this.closeSheet();
            else if (this.sheetHeight > this.defaultVh + 10) this.openFullSheet();
            else this.setSheetHeight(this.defaultVh);
            this.beforeVh = this.sheetHeight;
          });
        }
      });
    } catch (err) {
      console.error('BottomSheetBase: error binding drag', err);
    }
  }

  _destroyDrag() {
    if (this._dragController && typeof this._dragController.destroy === 'function') {
      this._dragController.destroy();
      this._dragController = null;
    }
  }

  setSheetHeight(vh) {
    if (!isMobile()) return;
    this.sheetHeight = Math.max(0, Math.min(100, Number(vh) || 0));
    setElementHeightVh(this._sheetWrapper, this.sheetHeight);
  }

  setIsSheetShown(isShown) {
    this.setAttribute('aria-hidden', String(!isShown));
    toggleBodyNoScroll(isShown);
  }

  openSheet() {
    if (this.defaultVh === 0) {
      if (this.hasAttribute('vh')) this.defaultVh = Number(this.getAttribute('vh'));
      else this.defaultVh = (this._sheetWrapper.offsetHeight / window.innerHeight) * 100 || 50;
    }
    this.beforeVh = this.defaultVh;
    this.setSheetHeight(this.defaultVh);
    this.setIsSheetShown(true);
    nextFrame().then(() => { try { this._sheetWrapper.focus && this._sheetWrapper.focus(); } catch (_) {} });
  }

  openFullSheet() {
    this.beforeVh = 100;
    this.setSheetHeight(100);
    this.setIsSheetShown(true);
  }

  closeSheet() {
    this.setSheetHeight(50);
    this.setIsSheetShown(false);
  }
}