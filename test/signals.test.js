import { describe, it, expect, beforeEach } from 'vitest';
import { createSignal, createEffect, createComputed, $state } from '../src/reactive/signals.js';

describe('Reactive - createSignal', () => {
  it('debe inicializar con valor', () => {
    const [get, set] = createSignal(0);
    expect(get()).toBe(0);
  });

  it('debe actualizar valor', () => {
    const [get, set] = createSignal(0);
    set(5);
    expect(get()).toBe(5);
  });

  it('debe soportar setter funcional', () => {
    const [get, set] = createSignal(10);
    set(v => v * 2);
    expect(get()).toBe(20);
  });

  it('debe manejar valores nulos', () => {
    const [get, set] = createSignal(null);
    expect(get()).toBe(null);
    set('value');
    expect(get()).toBe('value');
  });

  it('debe notificar suscriptores', () => {
    const [get, set, subscribe] = createSignal(0);
    const calls = [];

    subscribe(() => calls.push(get()));
    set(1);
    set(2);
    set(3);

    expect(calls).toEqual([1, 2, 3]);
  });

  it('debe permitir desuscripción', () => {
    const [get, set, subscribe] = createSignal(0);
    const calls = [];

    const unsub = subscribe(() => calls.push(get()));
    set(1);
    unsub();
    set(2);

    expect(calls).toEqual([1]);
  });

  it('debe no notificar si valor no cambió', () => {
    const [get, set, subscribe] = createSignal(5);
    const calls = [];

    subscribe(() => calls.push(get()));
    set(5); // mismo valor
    set(10);
    set(10); // mismo valor

    expect(calls).toEqual([10]);
  });

  it('debe soportar múltiples suscriptores', () => {
    const [get, set, subscribe] = createSignal(0);
    const sub1 = [];
    const sub2 = [];

    subscribe(() => sub1.push(get()));
    subscribe(() => sub2.push(get()));

    set(1);
    set(2);

    expect(sub1).toEqual([1, 2]);
    expect(sub2).toEqual([1, 2]);
  });
});

describe('Reactive - createEffect', () => {
  it('debe ejecutar inmediatamente', () => {
    const calls = [];
    createEffect(() => calls.push('executed'));
    expect(calls).toEqual(['executed']);
  });

  it('debe rastrear dependencias de signals', () => {
    const [get, set] = createSignal(0);
    const results = [];

    createEffect(() => {
      results.push(get());
    });

    set(1);
    set(2);
    set(3);

    expect(results).toEqual([0, 1, 2, 3]);
  });

  it('debe ejecutar cleanup antes de re-ejecutar', () => {
    const cleanups = [];
    const [get, set] = createSignal(0);

    createEffect(() => {
      const val = get();
      return () => cleanups.push(`cleanup-${val}`);
    });

    set(1);
    set(2);
    set(3);

    expect(cleanups).toEqual(['cleanup-0', 'cleanup-1', 'cleanup-2']);
  });

  it('debe permitir disposición manual', () => {
    const [get, set] = createSignal(0);
    const results = [];

    const dispose = createEffect(() => {
      results.push(get());
    });

    set(1);
    dispose();
    set(2);
    set(3);

    expect(results).toEqual([0, 1]);
  });

  it('debe ejecutar cleanup en disposición', () => {
    const cleanups = [];

    const dispose = createEffect(() => {
      return () => cleanups.push('cleanup');
    });

    dispose();
    expect(cleanups).toEqual(['cleanup']);
  });

  it('debe manejar errores sin quebrar', () => {
    const [get, set] = createSignal(0);
    const errorSpy = { called: false };

    // Capturar console.error
    const originalError = console.error;
    console.error = () => { errorSpy.called = true; };

    try {
      createEffect(() => {
        throw new Error('test error');
      });
    } finally {
      console.error = originalError;
    }

    expect(errorSpy.called).toBe(true);
  });

  it('debe no reejecutar si dependencias no cambian', () => {
    const [get, set, subscribe] = createSignal(0);
    const externalState = { value: 0 };
    const calls = [];

    createEffect(() => {
      // Solo depende de get(), no de externalState
      get();
      calls.push(externalState.value);
    });

    externalState.value = 1;
    expect(calls).toEqual([0]); // No debe re-ejecutar

    set(1); // Ahora sí
    expect(calls).toEqual([0, 1]);
  });
});

describe('Reactive - createComputed', () => {
  it('debe cachear valores', () => {
    const [get, set] = createSignal(2);
    const computeCount = { count: 0 };

    const computed = createComputed(() => {
      computeCount.count++;
      return get() * 2;
    });

    expect(computed()).toBe(4);
    expect(computed()).toBe(4); // No debe recalcular
    expect(computeCount.count).toBe(1);
  });

  it('debe recalcular si dependencias cambian', () => {
    const [get, set] = createSignal(2);
    const computeCount = { count: 0 };

    const computed = createComputed(() => {
      computeCount.count++;
      return get() * 3;
    });

    expect(computed()).toBe(6);
    expect(computeCount.count).toBe(1);

    set(5);
    expect(computed()).toBe(15);
    expect(computeCount.count).toBe(2);
  });

  it('debe soportar cleanup', () => {
    const [get, set] = createSignal(0);
    const cleanups = [];

    const computed = createComputed(() => {
      const val = get();
      return () => cleanups.push(val);
    });

    set(1);
    set(2);

    expect(cleanups).toEqual([0, 1]);
  });

  it('debe cachear a través de múltiples accesos', () => {
    const [get, set] = createSignal(10);
    const computeCount = { count: 0 };

    const computed = createComputed(() => {
      computeCount.count++;
      return get() + 5;
    });

    const a = computed();
    const b = computed();
    const c = computed();

    expect(a).toBe(15);
    expect(b).toBe(15);
    expect(c).toBe(15);
    expect(computeCount.count).toBe(1); // Solo 1 cálculo
  });
});

describe('Reactive - $state', () => {
  it('debe crear proxy reactivo', () => {
    const state = $state({ count: 0, name: 'John' });
    expect(state.count).toBe(0);
    expect(state.name).toBe('John');
  });

  it('debe notificar cambios de propiedad', () => {
    const state = $state({ x: 0 });
    const changes = [];

    state.subscribe((key, old, newVal) => {
      changes.push([key, old, newVal]);
    });

    state.x = 5;
    state.x = 10;

    expect(changes).toEqual([['x', 0, 5], ['x', 5, 10]]);
  });

  it('debe permitir inspect', () => {
    const initial = { a: 1, b: 2 };
    const state = $state(initial);

    expect(state.inspect()).toEqual({ a: 1, b: 2 });
  });

  it('debe rastrear múltiples propiedades', () => {
    const state = $state({ x: 0, y: 0, z: 0 });
    const changes = [];

    state.subscribe((key, old, newVal) => {
      changes.push(`${key}:${newVal}`);
    });

    state.x = 1;
    state.y = 2;
    state.z = 3;

    expect(changes).toEqual(['x:1', 'y:2', 'z:3']);
  });

  it('debe no notificar si propiedad no existe antes', () => {
    const state = $state({});
    const changes = [];

    state.subscribe((key, old, newVal) => {
      changes.push([key, old, newVal]);
    });

    state.newProp = 'value';

    expect(changes).toEqual([['newProp', undefined, 'value']]);
  });

  it('debe participar en dependency tracking', () => {
    const state = $state({ count: 0 });
    const results = [];

    createEffect(() => {
      results.push(state.count);
    });

    state.count = 1;
    state.count = 2;

    expect(results).toEqual([0, 1, 2]);
  });

  it('debe soportar delete', () => {
    const state = $state({ x: 1, y: 2 });
    const changes = [];

    state.subscribe((key, old, newVal) => {
      changes.push([key, old, newVal]);
    });

    delete state.x;

    expect(changes).toEqual([['x', 1, undefined]]);
    expect(state.x).toBeUndefined();
    expect(state.y).toBe(2);
  });
});