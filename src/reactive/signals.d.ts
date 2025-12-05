// src/reactive/signals.d.ts
export type Signal<T> = [
  get: () => T,
  set: (value: T | ((prev: T) => T)) => T,
  subscribe: (fn: () => void) => () => void
];

export interface StateProxy {
  subscribe(fn: (key: string, oldVal: any, newVal: any) => void): () => void;
  inspect(): Record<string, any>;
}

export function createSignal<T>(initial: T): Signal<T>;
export function createEffect(fn: () => void | (() => void)): () => void;
export function createComputed<T>(fn: () => T): () => T;
export function $state<T extends object>(initial: T): T & StateProxy;