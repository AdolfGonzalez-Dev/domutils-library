import DOMUtilsCore from './wrapper.js';
import { createDragController } from '../gestures/drag.js';
import { setElementHeightVh } from '../utils/dom-helpers.js';
import { getPoint } from '../gestures/touch.js';
import { clamp } from '../utils/math.js';

if (typeof DOMUtilsCore !== 'undefined') {
  DOMUtilsCore.prototype.drag = function (options = {}) {
    const el = this.get(0);
    if (!el) throw new Error('drag(): target not found');
    return createDragController(el, options);
  };

  DOMUtilsCore.prototype.setVhHeight = function (vh) {
    const el = this.get(0);
    if (!el) return this;
    setElementHeightVh(el, Number(vh));
    return this;
  };

  DOMUtilsCore.prototype.pos = function (e) { return getPoint(e); };

  DOMUtilsCore.prototype.showSheet = function () {
    const el = this.get(0);
    if (!el) return this;
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    return this;
  };

  DOMUtilsCore.prototype.hideSheet = function () {
    const el = this.get(0);
    if (!el) return this;
    el.setAttribute('aria-hidden', 'true');
    const anyShown = Array.from(document.querySelectorAll('bottom-sheet')).some(s => s.getAttribute('aria-hidden') === 'false');
    if (!anyShown) document.body.classList.remove('no-scroll');
    return this;
  };
}

export default DOMUtilsCore;