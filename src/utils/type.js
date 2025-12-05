export const isString = (v) => typeof v === 'string' || v instanceof String;
export const isNode = (v) => !!v && typeof v.nodeType === 'number';
export const isNodeList = (v) => typeof NodeList !== 'undefined' && v instanceof NodeList;
export const isWindow = (v) => !!v && typeof v.document === 'object' && typeof v.location === 'object';