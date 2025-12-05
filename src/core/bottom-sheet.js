import BottomSheetBase from './bottom-sheet-base.js';

class BottomSheet extends BottomSheetBase {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.getAttribute('title') && !this.querySelector('.sheet__wrapper > header.controls')) {
      const header = document.createElement('header');
      header.className = 'controls';
      header.innerHTML = `<div class="draggable-area"><div class="draggable-thumb"></div></div>
        <div class="title__wrapper"><span class="title">${this.getAttribute('title')}</span></div>`;
      const wrapper = this.querySelector('.sheet__wrapper');
      wrapper.insertBefore(header, wrapper.firstChild);
    }
  }
}

// Register only in environments with window and if not already defined
if (typeof window !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('bottom-sheet')) {
  try {
    customElements.define('bottom-sheet', BottomSheet);
  } catch (err) {
    // In case of duplicate registration races or older browsers, ignore.
    console.warn('bottom-sheet: customElements.define failed', err);
  }
}

export default BottomSheet;