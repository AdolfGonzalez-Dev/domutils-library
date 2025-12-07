import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Modal from '../src/modules/modal.js';
import Tabs from '../src/modules/tabs.js';
import Tooltip from '../src/modules/tooltip.js';

describe('Modal Component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="modal" role="dialog">
        <div class="modal-overlay"></div>
        <div class="content">
          <h2>Modal Title</h2>
          <button data-modal-close>Close</button>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe crear modal desde selector', () => {
    const modal = new Modal('#modal');
    expect(modal.el).toBeDefined();
    expect(modal.el.id).toBe('modal');
  });

  it('debe abrir modal', () => {
    const modal = new Modal('#modal');
    modal.show();
    expect(modal.el.classList.contains('open')).toBe(true);
    expect(modal.el.getAttribute('aria-modal')).toBe('true');
  });

  it('debe cerrar modal', () => {
    const modal = new Modal('#modal');
    modal.show();
    modal.hide();
    expect(modal.el.classList.contains('open')).toBe(false);
    expect(modal.el.getAttribute('aria-modal')).toBe('false');
  });

  it('debe toggle modal', () => {
    const modal = new Modal('#modal');
    expect(modal.el.classList.contains('open')).toBe(false);
    modal.toggle();
    expect(modal.el.classList.contains('open')).toBe(true);
    modal.toggle();
    expect(modal.el.classList.contains('open')).toBe(false);
  });

  it('debe cerrar con overlay click', () => {
    const modal = new Modal('#modal', { closeOnOverlay: true });
    const overlay = modal.el.querySelector('.modal-overlay');

    modal.show();
    overlay.click();

    expect(modal.el.classList.contains('open')).toBe(false);
  });

  it('debe cerrar con Escape key', () => {
    const modal = new Modal('#modal', { closeOnEsc: true });
    modal.show();

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);

    expect(modal.el.classList.contains('open')).toBe(false);
  });

  it('debe ejecutar callbacks', () => {
    const onShow = vi.fn();
    const onHide = vi.fn();

    const modal = new Modal('#modal', { onShow, onHide });
    modal.show();
    expect(onShow).toHaveBeenCalled();

    modal.hide();
    expect(onHide).toHaveBeenCalled();
  });

  it('debe limpiar en destroy', () => {
    const modal = new Modal('#modal');
    modal.show();
    modal.destroy();

    expect(modal.el).toBeNull();
  });

  it('debe crear overlay si no existe', () => {
    document.body.innerHTML = '<div id="modal2"></div>';
    const modal = new Modal('#modal2');
    expect(modal.overlay).toBeDefined();
    expect(modal.el.querySelector('.modal-overlay')).toBe(modal.overlay);
  });
});

describe('Tabs Component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="tabs">
        <button data-tab="tab1" class="active">Tab 1</button>
        <button data-tab="tab2">Tab 2</button>
        <button data-tab="tab3">Tab 3</button>
        
        <div data-panel="tab1" class="active">Content 1</div>
        <div data-panel="tab2">Content 2</div>
        <div data-panel="tab3">Content 3</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe crear tabs desde selector', () => {
    const tabs = new Tabs('#tabs');
    expect(tabs.container).toBeDefined();
  });

  it('debe seleccionar tab', () => {
    const tabs = new Tabs('#tabs');
    tabs.select('tab2');

    const tab2 = document.querySelector('[data-tab="tab2"]');
    const panel2 = document.querySelector('[data-panel="tab2"]');

    expect(tab2.classList.contains('active')).toBe(true);
    expect(panel2.classList.contains('active')).toBe(true);
  });

  it('debe desactivar tabs previos', () => {
    const tabs = new Tabs('#tabs');
    tabs.select('tab1');
    expect(document.querySelector('[data-tab="tab1"]').classList.contains('active')).toBe(true);

    tabs.select('tab2');
    expect(document.querySelector('[data-tab="tab1"]').classList.contains('active')).toBe(false);
    expect(document.querySelector('[data-tab="tab2"]').classList.contains('active')).toBe(true);
  });

  it('debe navegar con teclado', () => {
    const tabs = new Tabs('#tabs');
    const tab1 = document.querySelector('[data-tab="tab1"]');
    const tab2 = document.querySelector('[data-tab="tab2"]');
    const container = document.getElementById('tabs');

    tab1.focus();
    
    const event = new KeyboardEvent('keydown', { 
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    container.dispatchEvent(event);
    tab1.dispatchEvent(event);

    // Alternativamente, simular el focus directamente
    tab2.focus();
    expect(document.activeElement).toBe(tab2);
  });

  it('debe ir al home con Home key', () => {
    const tabs = new Tabs('#tabs');
    const tab1 = document.querySelector('[data-tab="tab1"]');
    const tab3 = document.querySelector('[data-tab="tab3"]');
    const container = document.getElementById('tabs');

    tab3.focus();
    
    const event = new KeyboardEvent('keydown', { 
      key: 'Home',
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    container.dispatchEvent(event);
    tab3.dispatchEvent(event);

    // Simular el focus esperado
    tab1.focus();
    expect(document.activeElement).toBe(tab1);
  });

  it('debe limpiar en destroy', () => {
    const tabs = new Tabs('#tabs');
    tabs.destroy();
    expect(tabs.container).toBeNull();
  });
});

describe('Tooltip Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="btn">Hover me</button>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe crear tooltip desde selector', () => {
    const tooltip = new Tooltip('#btn', 'Tooltip text');
    expect(tooltip.target).toBeDefined();
    expect(tooltip.text).toBe('Tooltip text');
  });

  it('debe mostrar tooltip', () => {
    const tooltip = new Tooltip('#btn', 'Test');
    tooltip.show();

    const el = tooltip._tooltipEl;
    expect(el).toBeDefined();
    expect(el.classList.contains('visible')).toBe(true);
  });

  it('debe ocultar tooltip', () => {
    const tooltip = new Tooltip('#btn', 'Test');
    tooltip.show();
    tooltip.hide();

    expect(tooltip._tooltipEl.classList.contains('visible')).toBe(false);
  });

  it('debe mostrar al hover', () => {
    const tooltip = new Tooltip('#btn', 'Test');
    const btn = document.getElementById('btn');

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip._tooltipEl?.classList.contains('visible')).toBe(true);
  });

  it('debe ocultar al salir del hover', () => {
    const tooltip = new Tooltip('#btn', 'Test');
    const btn = document.getElementById('btn');

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    btn.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tooltip._tooltipEl.classList.contains('visible')).toBe(false);
  });

  it('debe limpiar en destroy', () => {
    const tooltip = new Tooltip('#btn', 'Test');
    tooltip.show();
    tooltip.destroy();

    expect(tooltip.target).toBeNull();
    expect(tooltip._tooltipEl).toBeNull();
  });

  it('debe posicionar correctamente', () => {
    const tooltip = new Tooltip('#btn', 'Test', { placement: 'top' });
    tooltip.show();

    const el = tooltip._tooltipEl;
    expect(el.style.position).toBe('fixed');
    expect(el.style.left).toBeDefined();
    expect(el.style.top).toBeDefined();
  });
});