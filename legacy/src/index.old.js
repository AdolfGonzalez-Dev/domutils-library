// Entry point: factory + namespaces + exports
import DOMUtilsCore, * as CoreExports from './core/wrapper.js';
import * as Gestures from './gestures/index.js';
import * as Observers from './observers/index.js';
import * as Ajax from './ajax/fetch.js';
import * as Utils from './utils/utils.js';
import * as Sugar from './utils/sugar.js';

// core dom helpers (q/qa, scoped finders, body-safe shortcuts)
import {
  q,
  qa,
  createScopedFinder,
  createScopedAll,
  findInBody,
  findAllInBody,
  DOM as DOMShortcut
} from './core/dom.js';

// prototype extensions (adds convenience helpers)
import './core/dom-extensions.js';

export const DOMUtilsLibrary = (selectorOrNode) => new DOMUtilsCore(selectorOrNode);

// Namespaces
DOMUtilsLibrary.gestures = Gestures;
DOMUtilsLibrary.observers = Observers;
DOMUtilsLibrary.ajax = Ajax;
DOMUtilsLibrary.utils = { ...Utils, ...Sugar };
DOMUtilsLibrary.version = '0.1.0';

// Expose DOM helpers on the library root for convenience/migration
DOMUtilsLibrary.q = q;
DOMUtilsLibrary.qa = qa;
DOMUtilsLibrary.createScopedFinder = createScopedFinder;
DOMUtilsLibrary.createScopedAll = createScopedAll;
DOMUtilsLibrary.findInBody = findInBody;
DOMUtilsLibrary.findAllInBody = findAllInBody;
DOMUtilsLibrary.DOM = DOMShortcut;

export { CoreExports as core };
export default DOMUtilsLibrary;