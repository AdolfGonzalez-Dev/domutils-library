/**
 * Storage Utilities TypeScript Definitions
 */

export interface StorageOptions {
  type?: 'local' | 'session';
  default?: any;
  prefix?: string;
}

export interface StorageSize {
  bytes: number;
  kilobytes: number;
  percentage: number;
  available: number;
}

/**
 * Get value from storage with JSON parsing
 */
export function getStorage<T = any>(
  key: string,
  options?: StorageOptions & { default?: T }
): T | null;

/**
 * Set value in storage with JSON serialization
 */
export function setStorage(
  key: string,
  value: any,
  options?: StorageOptions
): boolean;

/**
 * Remove item from storage
 */
export function removeStorage(
  key: string,
  options?: StorageOptions
): boolean;

/**
 * Clear all storage
 */
export function clearStorage(
  options?: StorageOptions
): boolean;

/**
 * Check if key exists in storage
 */
export function hasStorage(
  key: string,
  options?: StorageOptions
): boolean;

/**
 * Get all items from storage as object
 */
export function getAllStorage(
  options?: StorageOptions
): Record<string, any>;

/**
 * Watch storage for changes (internal changes)
 */
export function watchStorage(
  key: string,
  callback: (newValue: any, oldValue: any) => void,
  options?: StorageOptions
): () => void;

/**
 * Watch storage for cross-tab changes
 */
export function onStorageChange(
  key: string | null,
  callback: (event: StorageEvent) => void,
  options?: StorageOptions
): () => void;

/**
 * Set storage item with expiration
 */
export function setStorageWithExpiration(
  key: string,
  value: any,
  ttl: number,
  options?: StorageOptions
): boolean;

/**
 * Get storage item with expiration check
 */
export function getStorageWithExpiration<T = any>(
  key: string,
  options?: StorageOptions & { default?: T }
): T | null;

/**
 * Get storage size
 */
export function getStorageSize(
  options?: StorageOptions
): StorageSize;