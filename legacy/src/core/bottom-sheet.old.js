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

customElements.define('bottom-sheet', BottomSheet);