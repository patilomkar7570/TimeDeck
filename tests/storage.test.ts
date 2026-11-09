import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultData, loadData, saveData, STORAGE_KEY, validateImport } from '../src/lib/storage';

const originalStorage = globalThis.localStorage;
function mockStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    },
  });
}

afterEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalStorage });
});

describe('local configuration validation', () => {
  it('creates a starter configuration with saved cities and groups', () => {
    const data = createDefaultData();
    expect(data.version).toBe(1);
    expect(data.cities.length).toBeGreaterThan(0);
    expect(data.groups).toContain('All cities');
    expect(data.preferences.theme).toBe('system');
  });

  it('accepts valid exported configuration data', () => {
    const data = createDefaultData();
    const restored = validateImport(JSON.parse(JSON.stringify(data)));
    expect(restored.cities.length).toBe(data.cities.length);
    expect(restored.preferences.timeFormat).toBe('24h');
  });

  it('rejects unsupported backup versions', () => {
    expect(() => validateImport({ version: 99, cities: [], preferences: {} })).toThrow('not supported');
  });


  it('migrates the previous local configuration key to the current key', () => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    });
    const oldData = createDefaultData();
    values.set('timedeck:v1', JSON.stringify(oldData));
    const migrated = loadData();
    expect(migrated.cities.length).toBe(oldData.cities.length);
    expect(values.has('timedeck:v2')).toBe(true);
  });


  it('starts new installs in Auto and preserves later manual theme choices', () => {
    mockStorage();
    const initial = loadData();
    expect(initial.preferences.theme).toBe('system');

    initial.preferences.theme = 'dark';
    saveData(initial);
    expect(loadData().preferences.theme).toBe('dark');
  });

  it('migrates the previous dark default to automatic appearance once', () => {
    mockStorage();
    const previous = createDefaultData();
    previous.preferences.theme = 'dark';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));

    const migrated = loadData();
    expect(migrated.preferences.theme).toBe('system');

    migrated.preferences.theme = 'dark';
    saveData(migrated);
    expect(loadData().preferences.theme).toBe('dark');
  });

  it('uses an isolated localStorage key for the application configuration', () => {
    mockStorage();
    const initial = createDefaultData();
    saveData(initial);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).version).toBe(1);
    expect(loadData().cities.length).toBe(initial.cities.length);
  });
});
