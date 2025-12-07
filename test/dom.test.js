import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { find, findAll, create, resolveRoot, q, qa } from '../src/core/dom.js';

describe('DOM - resolveRoot', () => {
  it('debe retornar document si no hay root', () => {
    expect(resolveRoot(null)).toBe(document);
    expect(resolveRoot(undefined)).toBe(document);
  });

  it('debe resolver selector string a elemento', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = resolveRoot('#app');
    expect(root).toBe(document.getElementById('app'));
    document.body.innerHTML = '';
  });

  it('debe retornar elemento si es Element', () => {
    const el = document.createElement('div');
    expect(resolveRoot(el)).toBe(el);
  });

  it('debe retornar document si es Document', () => {
    expect(resolveRoot(document)).toBe(document);
  });

  it('debe retornar null para selector inválido', () => {
    const result = resolveRoot('invalid:::selector');
    expect(result).toBeNull();
  });
});

describe('DOM - find', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <button class="btn">Button</button>
        <span class="btn">Span</span>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe encontrar elemento por selector global', () => {
    const btn = find('.btn');
    expect(btn).toBe(document.querySelector('.btn'));
  });

  it('debe encontrar elemento dentro de root', () => {
    const app = document.getElementById('app');
    const btn = find(app, '.btn');
    expect(btn).toBe(app.querySelector('.btn'));
  });

  it('debe retornar null si no encuentra', () => {
    const result = find('.nonexistent');
    expect(result).toBeNull();
  });

  it('debe soportar selector con root string', () => {
    const result = find('#app', '.btn');
    expect(result).toBe(document.querySelector('#app .btn'));
  });

  it('debe manejar selector inválido', () => {
    const result = find('invalid:::');
    expect(result).toBeNull();
  });
});

describe('DOM - findAll', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <button class="btn">Button 1</button>
        <button class="btn">Button 2</button>
        <span class="btn">Span</span>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('debe encontrar todos los elementos', () => {
    const btns = findAll('.btn');
    expect(btns).toHaveLength(3);
    expect(btns).toEqual(Array.from(document.querySelectorAll('.btn')));
  });

  it('debe encontrar dentro de root', () => {
    const app = document.getElementById('app');
    const btns = findAll(app, '.btn');
    expect(btns).toHaveLength(3);
  });

  it('debe retornar array vacío si no encuentra', () => {
    const result = findAll('.nonexistent');
    expect(result).toEqual([]);
  });

  it('debe retornar array de elementos', () => {
    const result = findAll('.btn');
    expect(Array.isArray(result)).toBe(true);
    expect(result.every(el => el instanceof Element)).toBe(true);
  });
});

describe('DOM - create', () => {
  it('debe crear elemento simple', () => {
    const el = create('div');
    expect(el.tagName).toBe('DIV');
  });

  it('debe crear con atributos', () => {
    const el = create('button', { class: 'btn', id: 'submit' });
    expect(el.className).toBe('btn');
    expect(el.id).toBe('submit');
  });

  it('debe crear con booleanos true', () => {
    const el = create('input', { disabled: true });
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  it('debe ignorar valores false/null/undefined', () => {
    const el = create('div', { class: 'active', disabled: false, data: null });
    expect(el.hasAttribute('class')).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(false);
    expect(el.hasAttribute('data')).toBe(false);
  });

  it('debe crear SVG con opción', () => {
    const circle = create('circle', { cx: '50', cy: '50', r: '40' }, { svg: true });
    expect(circle.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('debe manejar atributos números como strings', () => {
    const el = create('div', { tabindex: 0, 'data-count': 42 });
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('data-count')).toBe('42');
  });
});

describe('DOM - shortcuts q/qa', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <button class="btn">1</button>
        <button class="btn">2</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('q() debe encontrar un elemento', () => {
    const btn = q('.btn');
    expect(btn).toBe(document.querySelector('.btn'));
  });

  it('qa() debe encontrar todos', () => {
    const btns = qa('.btn');
    expect(btns).toHaveLength(2);
  });
});