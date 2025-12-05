// src/reactive/signals.js
// Improved reactive primitives with dependency tracking, cleanup and disposers.
// - createSignal: [get, set, subscribe]
// - createEffect(fn): returns disposer()
// - createComputed(fn): returns getter that caches and invalidates automatically
// - $state: proxy that participates in dependency tracking per-property

const EFFECT_STACK = []; // stack of active effect runners
const EFFECT_DEPS = new WeakMap(); // Map<runner, Set<signalKey>>

/**
 * Internal helper: track that `runner` depends on `signalKey`.
 * signalKey is any object with a __subs Set (e.g. a getter function or a property signal object).
 */
function _trackDependency(runner, signalKey) {
  if (!runner || !signalKey) return;
  if (!signalKey.__subs) signalKey.__subs = new Set();
  if (!signalKey.__subs.has(runner)) {
    signalKey.__subs.add(runner);
  }

  let deps = EFFECT_DEPS.get(runner);
  if (!deps) {
    deps = new Set();
    EFFECT_DEPS.set(runner, deps);
  }
  deps.add(signalKey);
}

/**
 * createSignal(initial)
 * returns [get, set, subscribe]
 */
export function createSignal(initial) {
  let value = initial;
  const subs = new Set(); // user subscribers and effect runners will be stored here

  function get() {
    const active = EFFECT_STACK[EFFECT_STACK.length - 1];
    if (active) {
      _trackDependency(active, get);
    }
    return value;
  }

  // attach __subs so tracking code can use it
  get.__subs = subs;

  function set(newVal) {
    const old = value;
    if (typeof newVal === 'function') {
      value = newVal(value);
    } else {
      value = newVal;
    }
    if (old === value) return value;

    // notify subscribers (copy to avoid mutation during iteration)
    const arr = Array.from(subs);
    arr.forEach((fn) => {
      try { fn(); } catch (err) { setTimeout(() => { throw err; }); }
    });
    return value;
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    subs.add(fn);
    return () => subs.delete(fn);
  }

  return [get, set, subscribe];
}

/**
 * createEffect(fn)
 * - runs fn immediately and whenever its dependencies change
 * - supports cleanup: if fn returns a function, it will be called before next run and on dispose
 * - returns a disposer function to stop the effect and clean up subscriptions
 */
export function createEffect(fn) {
  if (typeof fn !== 'function') throw new Error('createEffect: fn must be a function');

  let cleanup = null;

  const runner = () => {
    // remove previous subscriptions for this runner
    const prevDeps = EFFECT_DEPS.get(runner);
    if (prevDeps) {
      prevDeps.forEach((sigKey) => {
        try { sigKey.__subs && sigKey.__subs.delete(runner); } catch (_) {}
      });
      EFFECT_DEPS.delete(runner);
    }

    // execute previous cleanup
    try { if (typeof cleanup === 'function') cleanup(); } catch (err) { console.error(err); }
    cleanup = null;

    // run effect and collect dependencies
    EFFECT_STACK.push(runner);
    try {
      const maybeCleanup = fn();
      if (typeof maybeCleanup === 'function') cleanup = maybeCleanup;
    } catch (err) {
      console.error('createEffect error', err);
    } finally {
      EFFECT_STACK.pop();
    }
  };

  // initial run
  runner();

  // return disposer
  return () => {
    const deps = EFFECT_DEPS.get(runner);
    if (deps) {
      deps.forEach((sigKey) => {
        try { sigKey.__subs && sigKey.__subs.delete(runner); } catch (_) {}
      });
      EFFECT_DEPS.delete(runner);
    }
    try { if (typeof cleanup === 'function') cleanup(); } catch (err) { console.error(err); }
    cleanup = null;
  };
}

/**
 * createComputed(fn)
 * - returns a getter function that caches the computed value
 * - when dependencies change it marks dirty; the next call recomputes
 */
export function createComputed(fn) {
  if (typeof fn !== 'function') throw new Error('createComputed: fn must be a function');

  let cached;
  let dirty = true;
  let cleanup = null;

  const recompute = () => {
    // remove prev deps
    const prevDeps = EFFECT_DEPS.get(recompute);
    if (prevDeps) {
      prevDeps.forEach((sigKey) => {
        try { sigKey.__subs && sigKey.__subs.delete(recompute); } catch (_) {}
      });
      EFFECT_DEPS.delete(recompute);
    }
    try { if (typeof cleanup === 'function') cleanup(); } catch (_) {}
    cleanup = null;

    EFFECT_STACK.push(recompute);
    try {
      const result = fn();
      if (typeof result === 'function') {
        // compute returned a cleanup function
        cleanup = result;
      } else {
        cached = result;
      }
      dirty = false;
    } catch (err) {
      console.error('createComputed error', err);
    } finally {
      EFFECT_STACK.pop();
    }
  };

  // initial compute
  recompute();

  // getter
  return () => {
    if (dirty) recompute();
    return cached;
  };
}

/**
 * $state implementation that participates in dependency tracking per property.
 *
 * Implementation details:
 * - For each proxied target object we keep a Map of property -> signalKey object.
 * - signalKey is a plain object with a __subs Set that stores effect runners (functions).
 * - When a property is read inside an active effect, we call _trackDependency(activeRunner, signalKey).
 * - When a property is set or deleted, we notify signalKey.__subs by calling each runner.
 * - Additionally, the returned proxy exposes a .subscribe(fn) that behaves like before:
 *   fn(key, oldVal, newVal) will be called for any property change.
 */

const STATE_PROP_SIGNALS = new WeakMap(); // Map<target, Map<prop, signalKey>>

function _ensurePropSignalFor(target, prop) {
  let map = STATE_PROP_SIGNALS.get(target);
  if (!map) {
    map = new Map();
    STATE_PROP_SIGNALS.set(target, map);
  }
  let sig = map.get(prop);
  if (!sig) {
    sig = { __subs: new Set() }; // subscribers (effect runners)
    map.set(prop, sig);
  }
  return sig;
}

export function $state(initial = {}) {
  const globalSubs = new Set();

  const notifyGlobal = (key, oldVal, newVal) => {
    globalSubs.forEach(fn => {
      try { fn(key, oldVal, newVal); } catch (err) { console.error(err); }
    });
  };

  const handler = {
    get(target, prop, receiver) {
      if (prop === '__isState') return true;
      if (prop === 'subscribe') return (fn) => { globalSubs.add(fn); return () => globalSubs.delete(fn); };
      if (prop === 'inspect') return () => Object.assign({}, target);

      // tracking: if inside an effect, register dependency on this property
      const active = EFFECT_STACK[EFFECT_STACK.length - 1];
      if (active && typeof prop === 'string') {
        const sig = _ensurePropSignalFor(target, prop);
        _trackDependency(active, sig);
      }

      // normal property access
      return Reflect.get(target, prop, receiver);
    },

    set(target, prop, value, receiver) {
      const old = target[prop];
      if (old === value) { target[prop] = value; return true; }
      const result = Reflect.set(target, prop, value, receiver);

      // notify property-specific subscribers (effect runners)
      const map = STATE_PROP_SIGNALS.get(target);
      if (map) {
        const sig = map.get(prop);
        if (sig && sig.__subs) {
          Array.from(sig.__subs).forEach((runner) => {
            try { runner(); } catch (err) { setTimeout(() => { throw err; }); }
          });
        }
      }

      // notify global subscribers
      notifyGlobal(prop, old, value);
      return result;
    },

    deleteProperty(target, prop) {
      const old = target[prop];
      const existed = prop in target;
      const result = Reflect.deleteProperty(target, prop);

      if (existed) {
        // notify property-specific subscribers
        const map = STATE_PROP_SIGNALS.get(target);
        if (map) {
          const sig = map.get(prop);
          if (sig && sig.__subs) {
            Array.from(sig.__subs).forEach((runner) => {
              try { runner(); } catch (err) { setTimeout(() => { throw err; }); }
            });
          }
          map.delete(prop);
        }

        // global subscribers
        notifyGlobal(prop, old, undefined);
      }
      return result;
    }
  };

  return new Proxy(Object.assign({}, initial), handler);
}

export default {
  createSignal,
  createEffect,
  createComputed,
  $state
};
