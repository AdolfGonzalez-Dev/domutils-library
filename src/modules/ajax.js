// modules/ajax.js
// Módulo AJAX robusto y pequeño para DOMUtilsLibrary

/**
 * ajax(options)
 * options: {
 *   url: string (required),
 *   method: string ('GET'|'POST'...),
 *   data: any (object | FormData | string | Blob),
 *   headers: object,
 *   responseType: 'text'|'json'|'blob'|'formData'|'arrayBuffer',
 *   timeout: ms (0 = no timeout),
 *   credentials: 'same-origin'|'include'|'omit'
 * }
 */
export async function ajax(options = {}) {
  const {
    url,
    method = 'GET',
    data = null,
    headers = {},
    responseType = 'text',
    timeout = 0,
    credentials = 'same-origin',
  } = options;

  if (!url) throw new Error('ajax: url is required');

  const fetchOptions = {
    method,
    headers: { ...(headers || {}) },
    credentials,
  };

  // Body handling (skip body for GET/HEAD)
  const upperMethod = String(method || 'GET').toUpperCase();
  if (data !== null && upperMethod !== 'GET' && upperMethod !== 'HEAD') {
    if (data instanceof FormData) {
      fetchOptions.body = data; // browser sets Content-Type with boundary
    } else if (typeof data === 'object' && !(data instanceof Blob) && !(data instanceof ArrayBuffer)) {
      // default to JSON for plain objects
      fetchOptions.body = JSON.stringify(data);
      fetchOptions.headers['Content-Type'] = fetchOptions.headers['Content-Type'] || 'application/json';
    } else {
      // string, Blob, ArrayBuffer, etc.
      fetchOptions.body = data;
    }
  }

  const controller = new AbortController();
  fetchOptions.signal = controller.signal;

  let timeoutId = null;
  if (timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  let res;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    if (err && err.name === 'AbortError') throw new Error('ajax: request aborted (timeout or cancelled)');
    throw err;
  } finally {
    if (timeoutId != null) clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = `HTTP Error ${res.status}${text ? `: ${text}` : ''}`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = res;
    throw err;
  }

  const rt = String(responseType || 'text').toLowerCase();
  switch (rt) {
    case 'json':
      return res.json();
    case 'blob':
      return res.blob();
    case 'formdata':
      return res.formData();
    case 'arraybuffer':
      return res.arrayBuffer();
    default:
      return res.text();
  }
}

// Convenience helpers
export const get = (url, responseType = 'text', opts = {}) =>
  ajax(Object.assign({}, opts, { url, method: 'GET', responseType }));

export const json = (url, opts = {}) =>
  ajax(Object.assign({}, opts, { url, method: 'GET', responseType: 'json' }));

export const post = (url, data = null, responseType = 'text', opts = {}) =>
  ajax(Object.assign({}, opts, { url, method: 'POST', data, responseType }));

export const put = (url, data = null, responseType = 'text', opts = {}) =>
  ajax(Object.assign({}, opts, { url, method: 'PUT', data, responseType }));

export const del = (url, responseType = 'text', opts = {}) =>
  ajax(Object.assign({}, opts, { url, method: 'DELETE', responseType }));

// load HTML into an element
export const load = async (url, element, opts = {}) => {
  if (!element) throw new Error('ajax.load: element not provided');
  const html = await get(url, 'text', opts);
  element.innerHTML = html;
  return html;
};

// inject script and resolve when loaded
export const script = (url, opts = {}) => {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error('script: url required'));
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    const cleanup = () => {
      s.onload = s.onerror = null;
    };
    s.onload = () => {
      cleanup();
      resolve(s);
    };
    s.onerror = () => {
      cleanup();
      reject(new Error(`script load error: ${url}`));
    };
    if (opts.attrs && typeof opts.attrs === 'object') {
      Object.entries(opts.attrs).forEach(([k, v]) => s.setAttribute(k, v));
    }
    document.head.appendChild(s);
  });
};

export default {
  ajax,
  get,
  json,
  post,
  put,
  del,
  load,
  script,
};