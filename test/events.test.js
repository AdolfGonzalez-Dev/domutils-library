import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { on, off, once, delegate, trigger } from '../src/core/events.js';

describe('Events - on/off', () => {
  let element;
  let target;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <button class="btn" id="submit">Click me</button>
      </div>
    `;
    element = document.getElementById('root');
    target = element.querySelector('.btn');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe agregar event listener', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    on(target, 'click', handler);
    target.click();

    expect(spy.calls).toBe(1);
  });

  it('debe soportar múltiples eventos en string', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    on(target, 'click mousedown', handler);
    target.click();
    target.dispatchEvent(new MouseEvent('mousedown'));

    expect(spy.calls).toBe(2);
  });

  it('debe soportar array de eventos', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    on(target, ['click', 'mousedown'], handler);
    target.click();
    target.dispatchEvent(new MouseEvent('mousedown'));

    expect(spy.calls).toBe(2);
  });

  it('debe retornar función unbind', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    const unbind = on(target, 'click', handler);
    target.click();
    unbind();
    target.click();

    expect(spy.calls).toBe(1);
  });

  it('debe remover listeners con off', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    on(target, 'click', handler);
    target.click();
    off(target, 'click', handler);
    target.click();

    expect(spy.calls).toBe(1);
  });

  it('debe remover todos los listeners', () => {
    const spy1 = { calls: 0 };
    const spy2 = { calls: 0 };

    on(target, 'click', () => { spy1.calls++; });
    on(target, 'click', () => { spy2.calls++; });

    target.click();
    expect(spy1.calls).toBe(1);
    expect(spy2.calls).toBe(1);

    off(target, 'click');
    target.click();

    expect(spy1.calls).toBe(1);
    expect(spy2.calls).toBe(1);
  });

  it('debe soportar opciones de addEventListener', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    on(target, 'click', handler, { passive: true });
    target.click();

    expect(spy.calls).toBe(1);
  });
});

describe('Events - once', () => {
  let element;
  let target;

  beforeEach(() => {
    document.body.innerHTML = `<button id="btn">Click</button>`;
    target = document.getElementById('btn');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe ejecutar handler solo una vez', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    once(target, 'click', handler);
    target.click();
    target.click();
    target.click();

    expect(spy.calls).toBe(1);
  });

  it('debe retornar función unbind', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    const unbind = once(target, 'click', handler);
    unbind();
    target.click();

    expect(spy.calls).toBe(0);
  });
});

describe('Events - delegate', () => {
  let root;
  let btn;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <button class="btn">Button 1</button>
        <button class="btn">Button 2</button>
        <span class="other">Not a button</span>
      </div>
    `;
    root = document.getElementById('root');
    btn = root.querySelector('.btn');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe usar event delegation', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    delegate(root, '.btn', 'click', handler);
    btn.click();

    expect(spy.calls).toBe(1);
  });

  it('no debe disparar si selector no coincide', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    delegate(root, '.nonexistent', 'click', handler);
    btn.click();

    expect(spy.calls).toBe(0);
  });

  it('debe disparar para múltiples elementos coincidentes', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    delegate(root, '.btn', 'click', handler);
    root.querySelectorAll('.btn').forEach(b => b.click());

    expect(spy.calls).toBe(2);
  });

  it('debe retornar función unbind', () => {
    const spy = { calls: 0 };
    const handler = () => { spy.calls++; };

    const unbind = delegate(root, '.btn', 'click', handler);
    btn.click();
    unbind();
    btn.click();

    expect(spy.calls).toBe(1);
  });

  it('debe pasar el elemento coincidente como this y segundo argumento', () => {
    let capturedEl = null;
    let capturedThis = null;

    const handler = function(e, el) {
      capturedEl = el;
      capturedThis = this;
    };

    delegate(root, '.btn', 'click', handler);
    btn.click();

    expect(capturedEl).toBe(btn);
    expect(capturedThis).toBe(btn);
  });
});

describe('Events - trigger', () => {
  let target;

  beforeEach(() => {
    document.body.innerHTML = `<div id="target"></div>`;
    target = document.getElementById('target');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe disparar evento personalizado', () => {
    const spy = { called: false, detail: null };

    target.addEventListener('custom', (e) => {
      spy.called = true;
      spy.detail = e.detail;
    });

    trigger(target, 'custom', { message: 'hello' });

    expect(spy.called).toBe(true);
    expect(spy.detail).toEqual({ message: 'hello' });
  });

  it('debe retornar el evento disparado', () => {
    const event = trigger(target, 'custom', { test: true });

    expect(event).toBeDefined();
    expect(event.type).toBe('custom');
  });

  it('debe permitir cancelación y burbuja', () => {
    const spy = { cancelled: false, bubbled: false };

    target.addEventListener('custom', (e) => {
      spy.bubbled = e.bubbles;
      e.preventDefault();
      spy.cancelled = e.defaultPrevented;
    });

    trigger(target, 'custom', {});

    expect(spy.cancelled).toBe(true);
    expect(spy.bubbled).toBe(true);
  });
});