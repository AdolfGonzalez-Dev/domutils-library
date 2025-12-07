/**
 * DOMUtils Library - Complete TypeScript Definitions
 * @module index
 */

// ============================================
// Core Types
// ============================================

export interface DOMUtilsCore {
  length: number;
  nodes: Element[];

  // Navigation
  get(index?: number): Element | undefined;
  eq(index: number): DOMUtilsCore;
  toArray(): Element[];
  find(selector: string): DOMUtilsCore;

  // Iteration
  each(fn: (el: Element, index: number) => void): this;
  map<T>(fn: (el: Element, index: number) => T): T[];

  // Events - Direct listeners
  on(events: string, handler: (e: Event) => void, options?: AddEventListenerOptions): this;
  // Events - Delegated
  on(events: string, selector: string, handler: (e: Event, el: Element) => void, options?: AddEventListenerOptions): this;
  
  off(events: string, handler?: (e: Event) => void): this;
  off(events: string, selector: string, handler?: (e: Event) => void): this;
  
  once(events: string, handler: (e: Event) => void, options?: AddEventListenerOptions): this;

  // Classes
  addClass(name: string): this;
  removeClass(name: string): this;
  toggleClass(name: string, force?: boolean): this;

  // Visibility
  show(): this;
  hide(): this;
  isHidden(): boolean;
}

// Selector types
export type Selector = string | Element | NodeList | Element[] | null;

// ============================================
// Signal Types
// ============================================

export type Signal<T> = [
  get: () => T,
  set: (value: T | ((prev: T) => T)) => T,
  subscribe: (fn: () => void) => () => void
];

export interface StateProxy {
  subscribe(fn: (key: string, oldVal: any, newVal: any) => void): () => void;
  inspect(): Record<string, any>;
}

// ============================================
// Gesture Types
// ============================================

export interface SwipeInfo {
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  deltaX: number;
  deltaY: number;
  duration: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  originalEvent: Event;
}

export interface SwipeOptions {
  threshold?: number;
  maxTime?: number;
  allowedAngle?: number;
}

export interface DragInfo {
  el: Element;
  originalEvent: Event;
  dx: number;
  dy: number;
  newX: number;
  newY: number;
  startPointer?: { x: number; y: number };
  startRect?: DOMRect;
}

export interface DragOptions {
  axis?: 'x' | 'y' | null;
  bounds?: { min: number; max: number } | null;
  useTransform?: boolean;
  auto?: boolean;
  onStart?(info: DragInfo): void;
  onMove?(info: DragInfo): void;
  onEnd?(info: DragInfo): void;
}

export interface DragController {
  enable(): DragController;
  disable(): DragController;
  on(event: 'start' | 'move' | 'end', fn: (info: DragInfo) => void): () => void;
  destroy(): void;
}

// ============================================
// Observer Types
// ============================================

export interface ObserverHandle {
  observer: IntersectionObserver | ResizeObserver | MutationObserver;
  disconnect(): void;
  destroy(): void;
}

// ============================================
// AJAX Types
// ============================================

export interface AjaxOptions {
  url: string;
  method?: string;
  data?: any;
  headers?: Record<string, string>;
  responseType?: 'text' | 'json' | 'blob' | 'arrayBuffer' | 'formData';
  timeout?: number;
  credentials?: 'same-origin' | 'include' | 'omit';
}

// ============================================
// Component Types
// ============================================

export interface ModalOptions {
  overlaySelector?: string;
  closeSelector?: string;
  openClass?: string;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  onShow?: (el: Element) => void;
  onHide?: (el: Element) => void;
  focusFirst?: boolean;
}

export interface TabsOptions {
  tabSelector?: string;
  panelSelector?: string;
  activeClass?: string;
  initial?: string | null;
  useHash?: boolean;
}

export interface TooltipOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  container?: string | Element | Document;
  tooltipClass?: string;
  visibleClass?: string;
}

// ============================================
// Main Exports
// ============================================

/**
 * Factory function to create DOMUtilsCore instances
 * @example
 * const el = DOMUtilsLibrary('.button');
 * const $ = DOMUtilsLibrary;
 * $('.container').addClass('active');
 */
export function DOMUtilsLibrary(selector?: Selector): DOMUtilsCore;
export const $: typeof DOMUtilsLibrary;

/**
 * DOMUtils namespace with all sub-modules
 */
export namespace DOMUtilsLibrary {
  const version: string;

  // Gestures
  function onSwipe(el: Element, cb: (info: SwipeInfo) => void, opts?: SwipeOptions): () => void;
  function createDragController(target: Element | string, opts?: DragOptions): DragController;
  function addPointerDown(target: Element, handler: (e: PointerEvent | TouchEvent | MouseEvent) => void, options?: AddEventListenerOptions): () => void;
  function getPoint(e: Event): { x: number; y: number };
  function getX(e: Event): number;
  function getY(e: Event): number;

  // Observers
  function onVisible(target: Element | string, cb: (entry: IntersectionObserverEntry, obs: IntersectionObserver) => void, opts?: IntersectionObserverInit): ObserverHandle;
  function onResize(target: Element | string, cb: (rect: DOMRect, entry: ResizeObserverEntry) => void, opts?: any): ObserverHandle;
  function onMutation(target: Element | string, cb: (mutations: MutationRecord[], obs: MutationObserver) => void, opts?: MutationObserverInit): ObserverHandle;

  // AJAX
  function ajax(opts: AjaxOptions): Promise<any>;
  function get(url: string, responseType?: 'text' | 'json', opts?: Partial<AjaxOptions>): Promise<any>;
  function json(url: string, opts?: Partial<AjaxOptions>): Promise<any>;
  function post(url: string, data?: any, responseType?: 'text' | 'json', opts?: Partial<AjaxOptions>): Promise<any>;
  function put(url: string, data?: any, responseType?: 'text' | 'json', opts?: Partial<AjaxOptions>): Promise<any>;
  function del(url: string, responseType?: 'text' | 'json', opts?: Partial<AjaxOptions>): Promise<any>;
  function load(url: string, element: Element, opts?: Partial<AjaxOptions>): Promise<string>;
  function script(url: string, opts?: { attrs?: Record<string, string> }): Promise<HTMLScriptElement>;

  // Utils
  const utils: {
    debounce(fn: Function, wait?: number): Function;
    throttle(fn: Function, wait?: number): Function;
    clamp(v: number, min: number, max: number): number;
    lerp(a: number, b: number, t: number): number;
    compose(...fns: Function[]): (x: any) => any;
    noop(): void;
    identity<T>(v: T): T;
    isString(v: any): v is string;
    isNode(v: any): v is Node;
    isNodeList(v: any): v is NodeList;
  };

  // Storage namespace
  const storage: {
    /**
     * Get value from storage with JSON parsing
     */
    getStorage<T = any>(
      key: string,
      options?: { type?: 'local' | 'session'; default?: T }
    ): T | null;

    /**
     * Set value in storage with JSON serialization
     */
    setStorage(
      key: string,
      value: any,
      options?: { type?: 'local' | 'session' }
    ): boolean;

    /**
     * Remove item from storage
     */
    removeStorage(
      key: string,
      options?: { type?: 'local' | 'session' }
    ): boolean;

    /**
     * Clear all storage or by prefix
     */
    clearStorage(
      options?: { type?: 'local' | 'session'; prefix?: string }
    ): boolean;

    /**
     * Check if key exists in storage
     */
    hasStorage(
      key: string,
      options?: { type?: 'local' | 'session' }
    ): boolean;

    /**
     * Get all items from storage as object
     */
    getAllStorage(
      options?: { type?: 'local' | 'session'; prefix?: string }
    ): Record<string, any>;

    /**
     * Watch storage for changes (internal)
     */
    watchStorage(
      key: string,
      callback: (newValue: any, oldValue: any) => void,
      options?: { type?: 'local' | 'session' }
    ): () => void;

    /**
     * Watch storage for cross-tab changes
     */
    onStorageChange(
      key: string | null,
      callback: (event: StorageEvent) => void,
      options?: { type?: 'local' | 'session' }
    ): () => void;

    /**
     * Set storage item with expiration (TTL)
     */
    setStorageWithExpiration(
      key: string,
      value: any,
      ttl: number,
      options?: { type?: 'local' | 'session' }
    ): boolean;

    /**
     * Get storage item with expiration check
     */
    getStorageWithExpiration<T = any>(
      key: string,
      options?: { type?: 'local' | 'session'; default?: T }
    ): T | null;

    /**
     * Get storage size information
     */
    getStorageSize(
      options?: { type?: 'local' | 'session' }
    ): {
      bytes: number;
      kilobytes: number;
      percentage: number;
      available: number;
    };
  };

  // Reactive
  const reactive: {
    createSignal<T>(initial: T): Signal<T>;
    createEffect(fn: () => void | (() => void)): () => void;
    createComputed<T>(fn: () => T): () => T;
    $state<T extends object>(initial: T): T & StateProxy;
  };

  // Gestures namespace
  const gestures: {
    onSwipe: typeof onSwipe;
    createDragController: typeof createDragController;
    addPointerDown: typeof addPointerDown;
    getPoint: typeof getPoint;
    getX: typeof getX;
    getY: typeof getY;
  };

  // Observers namespace
  const observers: {
    onVisible: typeof onVisible;
    onResize: typeof onResize;
    onMutation: typeof onMutation;
  };

  // AJAX namespace
  const ajax: {
    ajax: typeof ajax;
    get: typeof get;
    json: typeof json;
    post: typeof post;
    put: typeof put;
    del: typeof del;
    load: typeof load;
    script: typeof script;
  };
}

// ============================================
// Component Classes
// ============================================

/**
 * Modal component with accessibility features
 */
export class Modal {
  constructor(selector: string | Element, options?: ModalOptions);
  show(): this;
  hide(): this;
  toggle(): this;
  destroy(): void;
}

/**
 * Tabs component with keyboard navigation
 */
export class Tabs {
  constructor(selector: string | Element, options?: TabsOptions);
  select(id: string, opts?: { setFocus?: boolean }): void;
  destroy(): void;
}

/**
 * Tooltip component with positioning
 */
export class Tooltip {
  constructor(target: string | Element, text: string, options?: TooltipOptions);
  show(): this;
  hide(): this;
  destroy(): void;
}

// ============================================
// Root Export
// ============================================

export interface DOMUtilsRoot {
  version: string;
  Modal: typeof Modal;
  Tabs: typeof Tabs;
  Tooltip: typeof Tooltip;
}

export default DOMUtilsRoot;