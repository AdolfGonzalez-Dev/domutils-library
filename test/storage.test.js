import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
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
} from '../src/utils/storage.js';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ============================================
  // Basic Operations
  // ============================================

  describe('getStorage & setStorage', () => {
    it('debe guardar y obtener valor simple', () => {
      setStorage('name', 'John');
      expect(getStorage('name')).toBe('John');
    });

    it('debe guardar y obtener objeto', () => {
      const user = { id: 1, name: 'John' };
      setStorage('user', user);
      expect(getStorage('user')).toEqual(user);
    });

    it('debe guardar y obtener array', () => {
      const numbers = [1, 2, 3];
      setStorage('numbers', numbers);
      expect(getStorage('numbers')).toEqual(numbers);
    });

    it('debe guardar y obtener valores complejos', () => {
      const data = {
        users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
        config: { theme: 'dark', lang: 'es' },
        timestamp: Date.now()
      };
      setStorage('data', data);
      expect(getStorage('data')).toEqual(data);
    });

    it('debe retornar null para clave inexistente', () => {
      expect(getStorage('nonexistent')).toBeNull();
    });

    it('debe retornar valor por defecto', () => {
      expect(getStorage('nonexistent', { default: 'default' })).toBe('default');
    });

    it('debe usar sessionStorage', () => {
      setStorage('temp', 'value', { type: 'session' });
      expect(getStorage('temp', { type: 'session' })).toBe('value');
      expect(getStorage('temp', { type: 'local' })).toBeNull();
    });

    it('debe retornar true al guardar exitosamente', () => {
      const result = setStorage('key', 'value');
      expect(result).toBe(true);
    });

    it('debe lanzar error si falta la clave', () => {
      expect(() => setStorage('', 'value')).toThrow();
      expect(() => getStorage('')).toThrow();
    });
  });

  // ============================================
  // Remove & Clear
  // ============================================

  describe('removeStorage & clearStorage', () => {
    it('debe remover elemento', () => {
      setStorage('key', 'value');
      expect(hasStorage('key')).toBe(true);
      removeStorage('key');
      expect(hasStorage('key')).toBe(false);
    });

    it('debe limpiar todo el storage', () => {
      setStorage('key1', 'value1');
      setStorage('key2', 'value2');
      clearStorage();
      expect(hasStorage('key1')).toBe(false);
      expect(hasStorage('key2')).toBe(false);
    });

    it('debe limpiar solo con prefijo', () => {
      setStorage('app_user', 'John');
      setStorage('app_theme', 'dark');
      setStorage('other_data', 'value');
      
      clearStorage({ prefix: 'app_' });
      
      expect(hasStorage('app_user')).toBe(false);
      expect(hasStorage('app_theme')).toBe(false);
      expect(hasStorage('other_data')).toBe(true);
    });

    it('debe retornar true al remover exitosamente', () => {
      setStorage('key', 'value');
      const result = removeStorage('key');
      expect(result).toBe(true);
    });
  });

  // ============================================
  // Check & Get All
  // ============================================

  describe('hasStorage & getAllStorage', () => {
    it('debe verificar si clave existe', () => {
      setStorage('exists', 'value');
      expect(hasStorage('exists')).toBe(true);
      expect(hasStorage('notexists')).toBe(false);
    });

    it('debe obtener todos los items', () => {
      setStorage('key1', 'value1');
      setStorage('key2', { id: 2 });
      setStorage('key3', [1, 2, 3]);
      
      const all = getAllStorage();
      expect(all.key1).toBe('value1');
      expect(all.key2).toEqual({ id: 2 });
      expect(all.key3).toEqual([1, 2, 3]);
    });

    it('debe obtener todos los items con prefijo', () => {
      setStorage('app_user', 'John');
      setStorage('app_theme', 'dark');
      setStorage('other_data', 'value');
      
      const app = getAllStorage({ prefix: 'app_' });
      expect(app.app_user).toBe('John');
      expect(app.app_theme).toBe('dark');
      expect(app.other_data).toBeUndefined();
    });

    it('debe retornar objeto vacío si storage está vacío', () => {
      expect(getAllStorage()).toEqual({});
    });
  });

  // ============================================
  // Watch Storage
  // ============================================

  describe('watchStorage', () => {
    it('debe detectar cambios', (done) => {
      setStorage('watched', 'initial');
      let callCount = 0;
      
      const unwatch = watchStorage('watched', (newVal, oldVal) => {
        callCount++;
        if (callCount === 1) {
          expect(oldVal).toBe('initial');
          expect(newVal).toBe('updated');
          unwatch();
          done();
        }
      });
      
      setTimeout(() => {
        setStorage('watched', 'updated');
      }, 150);
    });

    it('debe permitir desuscribirse', (done) => {
      setStorage('watched', 'initial');
      let callCount = 0;
      
      const unwatch = watchStorage('watched', () => {
        callCount++;
      });
      
      setTimeout(() => {
        unwatch();
        setStorage('watched', 'changed');
      }, 150);
      
      setTimeout(() => {
        expect(callCount).toBe(0);
        done();
      }, 300);
    });

    it('debe lanzar error si callback no es función', () => {
      expect(() => watchStorage('key', 'not a function')).toThrow();
    });
  });

  // ============================================
  // Storage Events (Cross-tab)
  // ============================================

  describe('onStorageChange', () => {
    it('debe escuchar cambios de storage', () => {
      let eventReceived = false;
      const unwatch = onStorageChange('test', () => {
        eventReceived = true;
      });

      // Simular evento de storage (cross-tab)
      const event = new StorageEvent('storage', {
        key: 'test',
        newValue: JSON.stringify('value'),
        storageArea: localStorage
      });
      
      window.dispatchEvent(event);
      
      expect(eventReceived).toBe(true);
      unwatch();
    });

    it('debe escuchar cambios de cualquier clave si key es null', () => {
      let eventReceived = false;
      const unwatch = onStorageChange(null, () => {
        eventReceived = true;
      });

      const event = new StorageEvent('storage', {
        key: 'any',
        newValue: JSON.stringify('value'),
        storageArea: localStorage
      });
      
      window.dispatchEvent(event);
      
      expect(eventReceived).toBe(true);
      unwatch();
    });

    it('debe lanzar error si callback no es función', () => {
      expect(() => onStorageChange('key', 'not a function')).toThrow();
    });
  });

  // ============================================
  // Expiration
  // ============================================

  describe('Storage with Expiration', () => {
    it('debe guardar con expiración', () => {
      setStorageWithExpiration('temp', { data: 'value' }, 10000);
      const value = getStorageWithExpiration('temp');
      expect(value).toEqual({ data: 'value' });
    });

    it('debe retornar null cuando expira', (done) => {
      setStorageWithExpiration('temp', 'value', 100); // 100ms TTL
      
      setTimeout(() => {
        const value = getStorageWithExpiration('temp');
        expect(value).toBeNull();
        done();
      }, 150);
    });

    it('debe retornar valor por defecto cuando expira', (done) => {
      setStorageWithExpiration('temp', 'value', 100);
      
      setTimeout(() => {
        const value = getStorageWithExpiration('temp', { default: 'expired' });
        expect(value).toBe('expired');
        done();
      }, 150);
    });

    it('debe lanzar error si TTL <= 0', () => {
      expect(() => setStorageWithExpiration('key', 'value', 0)).toThrow();
      expect(() => setStorageWithExpiration('key', 'value', -100)).toThrow();
    });

    it('debe remover item expirado automáticamente', (done) => {
      setStorageWithExpiration('temp', 'value', 100);
      
      setTimeout(() => {
        getStorageWithExpiration('temp');
        expect(hasStorage('temp')).toBe(false);
        done();
      }, 150);
    });
  });

  // ============================================
  // Storage Size
  // ============================================

  describe('getStorageSize', () => {
    it('debe calcular tamaño del storage', () => {
      setStorage('key1', 'value1');
      setStorage('key2', { nested: 'object' });
      
      const size = getStorageSize();
      expect(size.bytes).toBeGreaterThan(0);
      expect(size.kilobytes).toBeGreaterThan(0);
      expect(size.percentage).toBeGreaterThanOrEqual(0);
    });

    it('debe retornar 0 si storage vacío', () => {
      const size = getStorageSize();
      expect(size.bytes).toBe(0);
      expect(size.kilobytes).toBe(0);
    });

    it('debe tener propiedad available', () => {
      const size = getStorageSize();
      expect('available' in size).toBe(true);
    });

    it('debe diferenciar entre localStorage y sessionStorage', () => {
      setStorage('local', 'value', { type: 'local' });
      setStorage('session', 'value', { type: 'session' });
      
      const localSize = getStorageSize({ type: 'local' });
      const sessionSize = getStorageSize({ type: 'session' });
      
      expect(localSize.bytes).toBeGreaterThan(0);
      expect(sessionSize.bytes).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('debe manejar valores especiales', () => {
      setStorage('null', null);
      setStorage('undefined', undefined);
      setStorage('zero', 0);
      setStorage('false', false);
      setStorage('empty', '');
      
      expect(getStorage('null')).toBeNull();
      expect(getStorage('zero')).toBe(0);
      expect(getStorage('false')).toBe(false);
      expect(getStorage('empty')).toBe('');
    });

    it('debe manejar valores muy grandes', () => {
      const large = { data: 'x'.repeat(10000) };
      setStorage('large', large);
      expect(getStorage('large')).toEqual(large);
    });

    it('debe recuperarse de errores de JSON parsing', () => {
      localStorage.setItem('broken', 'not valid json {]');
      const value = getStorage('broken');
      expect(value).toBe('not valid json {]');
    });

    it('debe manejar múltiples tipos en un mismo storage', () => {
      setStorage('str', 'string');
      setStorage('num', 123);
      setStorage('obj', { key: 'value' });
      setStorage('arr', [1, 2, 3]);
      setStorage('bool', true);
      
      expect(typeof getStorage('str')).toBe('string');
      expect(typeof getStorage('num')).toBe('number');
      expect(typeof getStorage('obj')).toBe('object');
      expect(Array.isArray(getStorage('arr'))).toBe(true);
      expect(typeof getStorage('bool')).toBe('boolean');
    });

    it('debe ser case-sensitive', () => {
      setStorage('Key', 'value');
      expect(hasStorage('key')).toBe(false);
      expect(hasStorage('KEY')).toBe(false);
      expect(hasStorage('Key')).toBe(true);
    });
  });

  // ============================================
  // Integration
  // ============================================

  describe('Integration Tests', () => {
    it('debe funcionar con workflow completo', () => {
      // Save
      const user = { id: 1, name: 'John', email: 'john@example.com' };
      setStorage('user', user);
      
      // Verify exists
      expect(hasStorage('user')).toBe(true);
      
      // Retrieve
      const retrieved = getStorage('user');
      expect(retrieved).toEqual(user);
      
      // Update
      user.name = 'Jane';
      setStorage('user', user);
      expect(getStorage('user').name).toBe('Jane');
      
      // Remove
      removeStorage('user');
      expect(hasStorage('user')).toBe(false);
    });

    it('debe manejar múltiples claves y tipos', () => {
      const data = {
        settings: { theme: 'dark', lang: 'es' },
        user: { id: 1, name: 'John' },
        tokens: ['token1', 'token2'],
        count: 42
      };
      
      Object.entries(data).forEach(([key, value]) => {
        setStorage(key, value);
      });
      
      Object.entries(data).forEach(([key, value]) => {
        expect(getStorage(key)).toEqual(value);
      });
      
      const all = getAllStorage();
      expect(Object.keys(all).length).toBe(4);
    });
  });
});