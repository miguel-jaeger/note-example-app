// Safe localStorage helpers for SSR compatibility

const isBrowser = () => typeof window !== 'undefined';

export const storage = {
  get: <T>(key: string): T | null => {
    if (!isBrowser()) return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  getString: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silent fail in SSR or if storage is full
    }
  },

  setString: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silent fail
    }
  },

  remove: (key: string): void => {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  },

  clear: (): void => {
    if (!isBrowser()) return;
    try {
      localStorage.clear();
    } catch {
      // Silent fail
    }
  },
};

// Auth-specific storage helpers
export const authStorage = {
  getToken: (): string | null => storage.getString('accessToken'),
  setToken: (token: string): void => storage.setString('accessToken', token),
  removeToken: (): void => storage.remove('accessToken'),

  getUser: <T>(): T | null => storage.get<T>('user'),
  setUser: <T>(user: T): void => storage.set('user', user),
  removeUser: (): void => storage.remove('user'),

  clear: (): void => {
    storage.remove('accessToken');
    storage.remove('user');
  },
};
