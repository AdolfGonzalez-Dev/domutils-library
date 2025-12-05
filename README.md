# DOMUtils Library

> A lightweight, modern DOM utility library with reactive signals, accessible components, and gesture support.

[![Tests](https://github.com/AdolfDigitalDeveloper/domutils-library/actions/workflows/test.yml/badge.svg)](https://github.com/AdolfDigitalDeveloper/domutils-library/actions)
[![npm version](https://badge.fury.io/js/domutils-library.svg)](https://www.npmjs.com/package/domutils-library)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/domutils-library)](https://bundlephobia.com/package/domutils-library)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Features

✨ **Lightweight** - Only ~10KB minified (total bundle)  
🔄 **Reactive** - Fine-grained reactivity with Signals  
♿ **Accessible** - WCAG compliant components (Modal, Tabs, Tooltip)  
🖱️ **Gestures** - Drag, swipe, and pointer event handling  
👁️ **Observers** - IntersectionObserver, ResizeObserver, MutationObserver helpers  
📡 **AJAX** - Modern fetch-based HTTP requests  
🎨 **Animations** - Web Animations API with fallbacks  
📦 **Modern** - ES modules, TypeScript support, tree-shakeable  
🧪 **Well Tested** - 87 tests with 100% pass rate  

---

## 📦 Installation

```bash
npm install domutils-library
```

Or using yarn/pnpm:

```bash
yarn add domutils-library
pnpm add domutils-library
```

---

## 🚀 Quick Start

### Basic DOM Queries

```javascript
import { q, qa } from 'domutils-library';

// Find single element
const button = q('.btn');

// Find all elements
const items = qa('.item');
```

### Reactive Signals

```javascript
import { createSignal, createEffect } from 'domutils-library';

const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log('Count is now:', count());
});

setCount(5); // Logs: "Count is now: 5"
```

### Event Handling

```javascript
import { DOMUtilsLibrary as $ } from 'domutils-library';

// Add listener
$('.btn').on('click', (e) => {
  console.log('Clicked!');
});

// Delegation
$('.container').on('click', '.item', (e, item) => {
  console.log('Item clicked:', item);
});
```

### Components

```javascript
import { Modal, Tabs, Tooltip } from 'domutils-library';

// Modal
const modal = new Modal('#my-modal');
modal.show();
modal.hide();

// Tabs
const tabs = new Tabs('#tabs');
tabs.select('tab-2');

// Tooltip
const tooltip = new Tooltip('#btn', 'Help text');
tooltip.show();
```

---

## 📚 API Reference

### DOM Utilities

#### `q(selector) / qa(selector)`

Find single or all elements matching selector.

```javascript
import { q, qa } from 'domutils-library';

q('.button');      // Element | null
qa('.item');       // Element[]
```

#### `find(root?, selector)`

Flexible selector with optional root.

```javascript
import { find, findAll } from 'domutils-library';

find('.btn');                    // Search in document
find(container, '.btn');         // Search in container
findAll('.item');                // Return all matches
```

#### `create(tag, attrs?, options?)`

Create elements with attributes.

```javascript
import { create } from 'domutils-library';

create('button', { class: 'btn', disabled: true });
create('circle', { cx: 50, cy: 50, r: 40 }, { svg: true });
```

### Event Management

#### `on(el, events, handler, options?)`

Add event listeners with tracking.

```javascript
import { on } from 'domutils-library';

const unbind = on(button, 'click', () => {
  console.log('Clicked');
});

unbind(); // Remove listener
```

#### `delegate(root, selector, events, handler)`

Event delegation for dynamic elements.

```javascript
import { delegate } from 'domutils-library';

delegate(container, '.item', 'click', (e, item) => {
  item.classList.add('selected');
});
```

### Reactive Signals

#### `createSignal(initial)`

Create a reactive signal with getter/setter.

```javascript
import { createSignal } from 'domutils-library';

const [count, setCount, subscribe] = createSignal(0);

count();        // Get value: 0
setCount(5);    // Set value
setCount(v => v + 1);  // Update function

subscribe(() => {
  console.log('Value changed');
});
```

#### `createEffect(fn)`

Auto-run function when dependencies change.

```javascript
import { createEffect } from 'domutils-library';

const [name, setName] = createSignal('John');

createEffect(() => {
  document.title = `Hello, ${name()}`;
});

setName('Jane'); // Title updates automatically
```

#### `createComputed(fn)`

Cached computed values.

```javascript
import { createComputed } from 'domutils-library';

const [items, setItems] = createSignal([]);
const [filter, setFilter] = createSignal('');

const filtered = createComputed(() => {
  return items().filter(i => i.includes(filter()));
});

filtered(); // Only recalculates when items or filter change
```

#### `$state(initial)`

Reactive object with per-property tracking.

```javascript
import { $state, createEffect } from 'domutils-library';

const user = $state({ name: 'John', age: 30 });

createEffect(() => {
  console.log(user.name); // Runs when name changes
});

user.name = 'Jane'; // Effect re-runs
user.age = 31;      // Also triggers (tracked separately)
```

### Gestures

#### `createDragController(el, options?)`

Enable dragging with callbacks.

```javascript
import { createDragController } from 'domutils-library';

const drag = createDragController(element, {
  axis: 'x',
  onStart: (info) => console.log('Started'),
  onMove: (info) => console.log('Moving'),
  onEnd: (info) => console.log('Done')
});

drag.destroy();
```

#### `onSwipe(el, callback, options?)`

Listen for swipe gestures.

```javascript
import { onSwipe } from 'domutils-library';

const unbind = onSwipe(element, (info) => {
  console.log(info.direction); // 'left', 'right', 'up', 'down'
});
```

### Observers

#### `onVisible(el, callback, options?)`

IntersectionObserver helper.

```javascript
import { onVisible } from 'domutils-library';

onVisible(element, (entry) => {
  console.log('Element is visible');
});
```

#### `onResize(el, callback, options?)`

ResizeObserver helper.

```javascript
import { onResize } from 'domutils-library';

onResize(element, (rect) => {
  console.log('Width:', rect.width, 'Height:', rect.height);
});
```

#### `onMutation(el, callback, options?)`

MutationObserver helper.

```javascript
import { onMutation } from 'domutils-library';

onMutation(container, (mutations) => {
  console.log('DOM changed');
});
```

### AJAX

#### `ajax(options)`

Fetch-based HTTP requests.

```javascript
import { ajax } from 'domutils-library';

const data = await ajax({
  url: '/api/users',
  method: 'POST',
  data: { name: 'John' },
  responseType: 'json'
});
```

#### Helpers: `get`, `post`, `put`, `del`, `json`

```javascript
import { get, post, json } from 'domutils-library';

const data = await json('/api/data');
const users = await post('/api/users', { name: 'John' });
```

### Components

#### `Modal`

Accessible dialog with focus management.

```javascript
import { Modal } from 'domutils-library';

const modal = new Modal('#modal', {
  closeOnOverlay: true,
  closeOnEsc: true,
  onShow: (el) => console.log('Opened'),
  onHide: (el) => console.log('Closed')
});

modal.show();
modal.hide();
modal.toggle();
modal.destroy();
```

#### `Tabs`

Keyboard-accessible tabs.

```javascript
import { Tabs } from 'domutils-library';

const tabs = new Tabs('#tabs', {
  tabSelector: '[data-tab]',
  panelSelector: '[data-panel]',
  activeClass: 'active',
  useHash: true // Update URL hash
});

tabs.select('tab-2');
tabs.destroy();
```

#### `Tooltip`

Smart-positioned tooltips.

```javascript
import { Tooltip } from 'domutils-library';

const tooltip = new Tooltip('#button', 'Help text', {
  placement: 'top',
  offset: 8
});

tooltip.show();
tooltip.hide();
tooltip.destroy();
```

---

## 🏗️ Architecture

### Modular Structure

```
src/
├── core/           # DOM & Events
├── reactive/       # Signals & State
├── gestures/       # Drag, Swipe, Touch
├── observers/      # Intersection, Resize, Mutation
├── modules/        # Components (Modal, Tabs, Tooltip)
├── animations/     # Animation helpers
└── utils/          # Utilities & Helpers
```

### Size Breakdown

| Module | Size |
|--------|------|
| `index.esm.js` | 0.91KB |
| `reactive.esm.js` | 2.61KB |
| Total (minified) | ~10KB |

---

## 🧪 Testing

Run tests:

```bash
npm test          # Run tests once
npm run dev       # Watch mode
npm run test:coverage  # Coverage report
```

Tests cover:
- ✅ 87 test cases
- ✅ 100% pass rate
- ✅ All modules tested
- ✅ Real browser environment (jsdom)

---

## 🤝 Development

### Setup

```bash
git clone https://github.com/AdolfDigitalDeveloper/domutils-library.git
cd domutils-library
npm install
npm run test
```

### Build

```bash
npm run build
```

Generates ESM, CJS, and TypeScript definitions.

### Publishing

```bash
npm run build
npm login
npm publish
```

---

## 📋 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ All versions |
| Firefox | ✅ All versions |
| Safari | ✅ All versions |
| Edge | ✅ All versions |
| IE 11 | ⚠️ Partial (use polyfills) |

---

## 📝 Examples

### Counter App with Signals

```javascript
import { createSignal, createEffect } from 'domutils-library';
import { q } from 'domutils-library';

const [count, setCount] = createSignal(0);

createEffect(() => {
  q('#count').textContent = count();
});

q('#increment').addEventListener('click', () => {
  setCount(count() + 1);
});

q('#decrement').addEventListener('click', () => {
  setCount(count() - 1);
});
```

### Form with State

```javascript
import { $state, createEffect } from 'domutils-library';

const form = $state({
  name: '',
  email: '',
  message: ''
});

createEffect(() => {
  // Validate form
  const isValid = form.name && form.email && form.message;
  document.querySelector('button').disabled = !isValid;
});

document.addEventListener('input', (e) => {
  if (e.target.name) {
    form[e.target.name] = e.target.value;
  }
});
```

### Dynamic List with Drag

```javascript
import { $state, createEffect, createDragController } from 'domutils-library';

const items = $state({
  list: [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' }
  ]
});

createEffect(() => {
  const html = items.list.map(item => 
    `<div class="item" draggable="true">${item.text}</div>`
  ).join('');
  
  document.querySelector('#list').innerHTML = html;
});
```

---

## 🐛 Issues & Feedback

Found a bug? Have a feature request?

- 🐛 [Report Issues](https://github.com/AdolfDigitalDeveloper/domutils-library/issues)
- 💡 [Suggest Features](https://github.com/AdolfDigitalDeveloper/domutils-library/discussions)
- 📚 [View Documentation](https://github.com/AdolfDigitalDeveloper/domutils-library/wiki)

---

## 📄 License

MIT © 2025 [AdolfDigitalDev](LICENSE)

---

## 🙏 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -am 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🎓 Learn More

- 📖 [Full API Documentation](docs/api.md)
- 🎬 [Video Tutorials](https://youtube.com)
- 📝 [Blog Posts](https://blog.example.com)
- 💬 [Community Chat](https://discord.gg/example)

---

Made with ❤️ by [AdolfDigitalDev](https://github.com/AdolfDigitalDeveloper)