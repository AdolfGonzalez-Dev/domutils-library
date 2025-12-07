export const noop = () => {};
export const identity = (v) => v;
export const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);
export * from './type.js';
export * from './time.js';
export * from './math.js';