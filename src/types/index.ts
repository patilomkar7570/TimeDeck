export type ThemeMode = 'dark' | 'light' | 'system';
export type TimeFormat = '12h' | '24h';
export type ClockStyle = 'digital' | 'analog';
export type Section = 'world-clock' | 'compare-time' | 'time-converter' | 'settings';

export interface CityOption {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  continent?: string;
}

export interface SavedCity extends CityOption {
  favorite: boolean;
  group: string;
  addedAt: number;
}

export interface Preferences {
  theme: ThemeMode;
  accent: string;
  timeFormat: TimeFormat;
  clockStyle: ClockStyle;
  defaultHomeCity: string;
  rememberSection: boolean;
  lastSection: Section;
  sidebarCollapsed: boolean;
}

export interface AppData {
  version: 1;
  preferences: Preferences;
  cities: SavedCity[];
  groups: string[];
}
