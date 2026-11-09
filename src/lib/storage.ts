import type { AppData, Preferences, SavedCity } from '../types';
import { DEFAULT_CITIES } from './catalog';

export const STORAGE_KEY = 'timedeck:v2';
const LEGACY_STORAGE_KEY = 'timedeck:v1';
const THEME_AUTO_MIGRATION_KEY = 'timedeck:theme-auto-default-v1';

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  accent: '#8B7CFF',
  timeFormat: '24h',
  clockStyle: 'digital',
  defaultHomeCity: 'Asia/Kolkata',
  rememberSection: true,
  lastSection: 'world-clock',
  sidebarCollapsed: false,
};

export function createDefaultData(): AppData {
  const cities: SavedCity[] = DEFAULT_CITIES.map((city, index) => ({
    ...city, favorite: index < 4, group: 'All cities', addedAt: Date.now() + index,
  }));
  return { version: 1, preferences: { ...DEFAULT_PREFERENCES }, cities, groups: ['All cities', 'Work', 'Family'] };
}

function isSavedCity(value: unknown): value is SavedCity {
  if (!value || typeof value !== 'object') return false;
  const city = value as Record<string, unknown>;
  if (!(typeof city.id === 'string' && typeof city.city === 'string'
    && typeof city.country === 'string' && typeof city.countryCode === 'string'
    && typeof city.timezone === 'string' && typeof city.favorite === 'boolean'
    && typeof city.group === 'string' && typeof city.addedAt === 'number')) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: city.timezone }); return true; }
  catch { return false; }
}

export function validateImport(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('The selected file is not a valid TimeDeck backup.');
  const input = value as Record<string, unknown>;
  if (input.version !== 1 || !Array.isArray(input.cities) || !input.preferences || typeof input.preferences !== 'object') {
    throw new Error('This backup format is not supported.');
  }
  const rawCities = input.cities.filter(isSavedCity);
  const cities = [...new Map(rawCities.map((city) => [city.id, city])).values()];
  const candidate = { ...DEFAULT_PREFERENCES, ...(input.preferences as Partial<Preferences>) };
  const validTimezone = (timezone: string) => {
    try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }); return true; }
    catch { return false; }
  };
  const preferences: Preferences = {
    theme: ['dark', 'light', 'system'].includes(candidate.theme) ? candidate.theme : DEFAULT_PREFERENCES.theme,
    accent: /^#[0-9a-f]{6}$/i.test(candidate.accent) ? candidate.accent : DEFAULT_PREFERENCES.accent,
    timeFormat: ['12h', '24h'].includes(candidate.timeFormat) ? candidate.timeFormat : DEFAULT_PREFERENCES.timeFormat,
    clockStyle: ['digital', 'analog'].includes(candidate.clockStyle) ? candidate.clockStyle : DEFAULT_PREFERENCES.clockStyle,
    defaultHomeCity: validTimezone(candidate.defaultHomeCity) ? candidate.defaultHomeCity : DEFAULT_PREFERENCES.defaultHomeCity,
    rememberSection: typeof candidate.rememberSection === 'boolean' ? candidate.rememberSection : DEFAULT_PREFERENCES.rememberSection,
    lastSection: ['world-clock', 'compare-time', 'time-converter', 'settings'].includes(candidate.lastSection) ? candidate.lastSection : DEFAULT_PREFERENCES.lastSection,
    sidebarCollapsed: typeof candidate.sidebarCollapsed === 'boolean' ? candidate.sidebarCollapsed : DEFAULT_PREFERENCES.sidebarCollapsed,
  };
  const suppliedGroups = Array.isArray(input.groups) ? input.groups.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : ['All cities'];
  const cityGroups = cities.map((city) => city.group);
  return { version: 1, preferences, cities, groups: [...new Set(['All cities', ...suppliedGroups, ...cityGroups])] };
}

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(THEME_AUTO_MIGRATION_KEY, '1');
      return createDefaultData();
    }
    const parsed = JSON.parse(stored) as unknown;
    let validated = validateImport(parsed);
    // The previous release defaulted new installs to dark mode. On the first
    // upgraded launch, move that old default to Auto/System once; later manual
    // Dark or Light selections are preserved normally.
    if (!localStorage.getItem(THEME_AUTO_MIGRATION_KEY)) {
      if (validated.preferences.theme === 'dark') {
        validated = { ...validated, preferences: { ...validated.preferences, theme: 'system' } };
      }
      localStorage.setItem(THEME_AUTO_MIGRATION_KEY, '1');
    }
    if (!localStorage.getItem(STORAGE_KEY) || validated.preferences.theme === 'system') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    }
    return validated;
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
