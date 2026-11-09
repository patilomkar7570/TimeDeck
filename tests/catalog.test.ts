import { describe, expect, it } from 'vitest';
import { CITY_CATALOG, countryFlag, searchCities } from '../src/lib/catalog';

describe('bundled city catalogue', () => {
  it('contains IANA timezone entries and a comprehensive set of cities', () => {
    expect(CITY_CATALOG.length).toBeGreaterThan(100);
    expect(CITY_CATALOG.some((city) => city.timezone === 'Asia/Kolkata')).toBe(true);
    expect(CITY_CATALOG.some((city) => city.timezone === 'Europe/London')).toBe(true);
  });

  it('searches by city, country and timezone identifier', () => {
    expect(searchCities('London').some((city) => city.timezone === 'Europe/London')).toBe(true);
    expect(searchCities('Japan').some((city) => city.timezone === 'Asia/Tokyo')).toBe(true);
    expect(searchCities('America/New_York').some((city) => city.timezone === 'America/New_York')).toBe(true);
  });

  it('creates country flags from ISO country codes', () => {
    expect(countryFlag('IN')).toBe('🇮🇳');
    expect(countryFlag('')).toBe('🌐');
  });
});
