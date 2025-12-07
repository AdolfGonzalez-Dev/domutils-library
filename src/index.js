// index.js - Central exports (consolidated) + factory compatibility layer
// This file preserves the previous consolidated exports and also exposes a factory function
// DOMUtilsLibrary(selector) and alias $ for compatibility with legacy users.

import * as DOMCore from './core/dom.js';
import * as EventsCore from './core/events.js';
import * as DomExt from './core/dom-helpers-extended.js';
import * as EventsExt from './core/event-helpers.js';

import * as ModalModule from './modules/modal.js';
import * as TooltipModule from './modules/tooltip.js';
import * as TabsModule from './modules/tabs.js';

import * as AjaxModule from './modules/ajax.js';
import * as AnimModule from './animations/animate.js';
import * as Reactive from './reactive/signals.js';

import * as Gestures from './gestures/index.js';
import * as Observers from './observers/index.js';
import * as Utils from './utils/utils.js';
import * as Sugar from './utils/sugar.js';
import * as Storage from './utils/storage.js';

// Default/root export (namespaced, predictable)
const DOMUtilsRoot = {
  // Core helpers
  ...DOMCore,
  ...EventsCore,

  // Extended DOM helpers namespace
  dom: {
    ...DomExt
  },

  // Extra event helpers
  events: {
    ...EventsExt
  },

  // Components as constructors/classes (preserve names)
  Modal: ModalModule.Modal,
  Tooltip: TooltipModule.Tooltip,
  Tabs: TabsModule.Tabs,

  // AJAX namespace
  ajax: {
    ...AjaxModule
  },

  // Animations namespace
  anim: {
    ...AnimModule
  },

  // Reactive namespace
  reactive: {
    ...Reactive
  }
};

// Factory compatibility: expose function-style API similar to legacy
import DOMUtilsCore from './core/wrapper.js';

/**
 * DOMUtilsLibrary(selector) -> returns DOMUtilsCore instance (factory)
 * Also exposes namespaces (gestures, observers, ajax, utils) on the function for convenience.
 */
export function DOMUtilsLibrary(selectorOrNode) {
  return new DOMUtilsCore(selectorOrNode);
}

// attach namespaces to factory function for compatibility
DOMUtilsLibrary.gestures = Gestures;
DOMUtilsLibrary.observers = Observers;
DOMUtilsLibrary.ajax = AjaxModule;
DOMUtilsLibrary.utils = { ...Utils, ...Sugar };
DOMUtilsLibrary.storage = Storage;
DOMUtilsLibrary.version = '0.1.0';

// Alias $
export const $ = DOMUtilsLibrary;

// Default export remains the object namespace root
export default DOMUtilsRoot;

// Also export root as named export
export { DOMUtilsRoot as DOMUtilsLibraryRoot };
