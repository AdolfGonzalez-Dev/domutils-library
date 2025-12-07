/**
 * DOMUtils Storage Utilities
 * LocalStorage and SessionStorage helpers with JSON support
 * @module utils/storage
 */

/**
 * Get value from storage with JSON parsing
 *
 * @param {string} key - Storage key
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - 'local' for localStorage, 'session' for sessionStorage
 * @param {any} [options.default=null] - Default value if not found
 * @returns {any} Parsed value or default
 *
 * @example
 * const user = getStorage('user');
 * const settings = getStorage('settings', { default: {} });
 * const sessionData = getStorage('temp', { type: 'session' });
 */
export function getStorage(key, options = {}) {
  const { type = 'local', default: defaultValue = null } = options;
  
  if (!key) throw new Error('Storage key is required');
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const item = storage.getItem(key);
    
    if (item === null) return defaultValue;
    
    try {
      return JSON.parse(item);
    } catch (_) {
      // If JSON parse fails, return raw value
      return item;
    }
  } catch (err) {
    console.error(`Storage get error for key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Set value in storage with JSON serialization
 *
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - 'local' for localStorage, 'session' for sessionStorage
 * @returns {boolean} Success status
 *
 * @example
 * setStorage('user', { name: 'John', id: 1 });
 * setStorage('tempData', [1, 2, 3], { type: 'session' });
 * setStorage('theme', 'dark');
 */
export function setStorage(key, value, options = {}) {
  const { type = 'local' } = options;
  
  if (!key) throw new Error('Storage key is required');
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    storage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`Storage set error for key "${key}":`, err);
    return false;
  }
}

/**
 * Remove item from storage
 *
 * @param {string} key - Storage key
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @returns {boolean} Success status
 *
 * @example
 * removeStorage('user');
 * removeStorage('tempData', { type: 'session' });
 */
export function removeStorage(key, options = {}) {
  const { type = 'local' } = options;
  
  if (!key) throw new Error('Storage key is required');
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Storage remove error for key "${key}":`, err);
    return false;
  }
}

/**
 * Clear all storage
 *
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @param {string} [options.prefix] - Only clear keys with this prefix
 * @returns {boolean} Success status
 *
 * @example
 * clearStorage(); // Clear all localStorage
 * clearStorage({ type: 'session' }); // Clear all sessionStorage
 * clearStorage({ prefix: 'app_' }); // Clear only 'app_*' keys
 */
export function clearStorage(options = {}) {
  const { type = 'local', prefix = null } = options;
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    
    if (prefix) {
      // Clear only keys with prefix
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          storage.removeItem(key);
        }
      });
    } else {
      // Clear all
      storage.clear();
    }
    
    return true;
  } catch (err) {
    console.error('Storage clear error:', err);
    return false;
  }
}

/**
 * Check if key exists in storage
 *
 * @param {string} key - Storage key
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @returns {boolean} Whether key exists
 *
 * @example
 * if (hasStorage('user')) {
 *   const user = getStorage('user');
 * }
 */
export function hasStorage(key, options = {}) {
  const { type = 'local' } = options;
  
  if (!key) return false;
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    return storage.getItem(key) !== null;
  } catch (err) {
    console.error(`Storage has error for key "${key}":`, err);
    return false;
  }
}

/**
 * Get all items from storage as object
 *
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @param {string} [options.prefix] - Only get keys with this prefix
 * @returns {Object} All storage items as key-value pairs
 *
 * @example
 * const allData = getAllStorage();
 * const appData = getAllStorage({ prefix: 'app_' });
 */
export function getAllStorage(options = {}) {
  const { type = 'local', prefix = null } = options;
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const result = {};
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      
      if (prefix && !key.startsWith(prefix)) continue;
      
      const item = storage.getItem(key);
      try {
        result[key] = JSON.parse(item);
      } catch (_) {
        result[key] = item;
      }
    }
    
    return result;
  } catch (err) {
    console.error('Storage getAll error:', err);
    return {};
  }
}

/**
 * Watch storage for changes (internal changes, not cross-tab)
 *
 * @param {string} key - Storage key to watch
 * @param {Function} callback - Callback function (newValue, oldValue) => void
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @returns {Function} Unwatch function
 *
 * @example
 * const unwatch = watchStorage('user', (newUser, oldUser) => {
 *   console.log('User changed:', oldUser, '->', newUser);
 * });
 *
 * // Later: stop watching
 * unwatch();
 */
export function watchStorage(key, callback, options = {}) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  const { type = 'local' } = options;
  let lastValue = getStorage(key, { type });
  
  // Check for changes periodically
  const interval = setInterval(() => {
    const newValue = getStorage(key, { type });
    if (newValue !== lastValue) {
      try {
        callback(newValue, lastValue);
      } catch (err) {
        console.error('Watch callback error:', err);
      }
      lastValue = newValue;
    }
  }, 100);
  
  // Return unwatch function
  return () => clearInterval(interval);
}

/**
 * Watch storage for cross-tab changes (uses storage event)
 * Triggered when storage changes in another tab/window
 *
 * @param {string} key - Storage key to watch (or null for all)
 * @param {Function} callback - Callback function (event) => void
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @returns {Function} Unwatch function
 *
 * @example
 * const unwatch = onStorageChange('user', (e) => {
 *   console.log('Storage changed in another tab:', e.key, e.newValue);
 * });
 *
 * unwatch();
 */
export function onStorageChange(key, callback, options = {}) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  const { type = 'local' } = options;
  
  const handler = (e) => {
    // Only trigger for correct storage type
    if (e.storageArea !== (type === 'local' ? localStorage : sessionStorage)) {
      return;
    }
    
    // Trigger if key matches (or null means all)
    if (key === null || e.key === key) {
      try {
        callback(e);
      } catch (err) {
        console.error('Storage change callback error:', err);
      }
    }
  };
  
  window.addEventListener('storage', handler);
  
  // Return unwatch function
  return () => {
    window.removeEventListener('storage', handler);
  };
}

/**
 * Set storage item with expiration
 *
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @returns {boolean} Success status
 *
 * @example
 * // Store for 1 hour
 * setStorageWithExpiration('session', { id: 123 }, 60 * 60 * 1000);
 *
 * // Later, it will return null
 * const session = getStorage('session'); // null after expiration
 */
export function setStorageWithExpiration(key, value, ttl, options = {}) {
  const { type = 'local' } = options;
  
  if (!key) throw new Error('Storage key is required');
  if (ttl <= 0) throw new Error('TTL must be greater than 0');
  
  try {
    const data = {
      value,
      expiration: Date.now() + ttl
    };
    
    return setStorage(key, data, { type });
  } catch (err) {
    console.error(`Storage setWithExpiration error for key "${key}":`, err);
    return false;
  }
}

/**
 * Get storage item with expiration check
 *
 * @param {string} key - Storage key
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @param {any} [options.default=null] - Default value if expired
 * @returns {any} Value if not expired, default otherwise
 *
 * @example
 * const session = getStorageWithExpiration('session');
 * if (!session) {
 *   // Expired or not found
 * }
 */
export function getStorageWithExpiration(key, options = {}) {
  const { type = 'local', default: defaultValue = null } = options;
  
  try {
    const data = getStorage(key, { type });
    
    if (!data || typeof data !== 'object' || !('expiration' in data)) {
      return data; // Not an expiring item
    }
    
    if (Date.now() > data.expiration) {
      // Expired
      removeStorage(key, { type });
      return defaultValue;
    }
    
    // Not expired
    return data.value;
  } catch (err) {
    console.error(`Storage getWithExpiration error for key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Get storage size (rough estimate)
 *
 * @param {Object} [options={}] - Options
 * @param {string} [options.type='local'] - Storage type
 * @returns {Object} Size info { bytes, kilobytes, percentage }
 *
 * @example
 * const size = getStorageSize();
 * console.log(`Using ${size.kilobytes}KB (${size.percentage}%)`);
 */
export function getStorageSize(options = {}) {
  const { type = 'local' } = options;
  
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    let bytes = 0;
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      const item = storage.getItem(key);
      bytes += key.length + item.length;
    }
    
    const kilobytes = (bytes / 1024).toFixed(2);
    const maxSize = 5120; // 5MB typical limit
    const percentage = ((bytes / (maxSize * 1024)) * 100).toFixed(2);
    
    return {
      bytes,
      kilobytes: parseFloat(kilobytes),
      percentage: parseFloat(percentage),
      available: maxSize - kilobytes
    };
  } catch (err) {
    console.error('Storage size error:', err);
    return { bytes: 0, kilobytes: 0, percentage: 0, available: 0 };
  }
}

export default {
  getStorage,
  setStorage,
  removeStorage,
  clearStorage,
  hasStorage,
  getAllStorage,
  watchStorage,
  onStorageChange,
  setStorageWithExpiration,
  getStorageWithExpiration,
  getStorageSize
};