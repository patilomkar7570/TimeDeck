import { rawTimeZones } from '@vvo/tzdb';
import type { CityOption } from '../types';

type RawZone = {
  name: string;
  countryName?: string;
  countryCode?: string;
  continentName?: string;
  mainCities?: string[];
};

const rawZones = rawTimeZones as RawZone[];

function makeId(city: string, timezone: string) {
  return `${timezone}::${city}`.toLowerCase();
}

const DATASET_CITIES: CityOption[] = rawZones
  .flatMap((zone) => {
    const cityNames = zone.mainCities?.length
      ? zone.mainCities
      : [zone.name.split('/').pop()?.replaceAll('_', ' ') ?? zone.name];
    return cityNames.map((city) => ({
      id: makeId(city, zone.name),
      city: city.replaceAll('_', ' '),
      country: zone.countryName ?? 'Unknown country',
      countryCode: zone.countryCode ?? '',
      timezone: zone.name,
      continent: zone.continentName,
    }));
  })
  .filter((city, index, all) => all.findIndex((item) => item.id === city.id) === index)
  .sort((a, b) => a.city.localeCompare(b.city));

const COMMON_CITIES: CityOption[] = [
  ['Pune', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['Mumbai', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['New Delhi', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['Bengaluru', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['Chennai', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['Hyderabad', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['Kolkata', 'India', 'IN', 'Asia/Kolkata', 'Asia'],
  ['London', 'United Kingdom', 'GB', 'Europe/London', 'Europe'],
  ['New York', 'United States', 'US', 'America/New_York', 'North America'],
  ['Los Angeles', 'United States', 'US', 'America/Los_Angeles', 'North America'],
  ['Chicago', 'United States', 'US', 'America/Chicago', 'North America'],
  ['San Francisco', 'United States', 'US', 'America/Los_Angeles', 'North America'],
  ['Toronto', 'Canada', 'CA', 'America/Toronto', 'North America'],
  ['Vancouver', 'Canada', 'CA', 'America/Vancouver', 'North America'],
  ['Berlin', 'Germany', 'DE', 'Europe/Berlin', 'Europe'],
  ['Paris', 'France', 'FR', 'Europe/Paris', 'Europe'],
  ['Tokyo', 'Japan', 'JP', 'Asia/Tokyo', 'Asia'],
  ['Dubai', 'United Arab Emirates', 'AE', 'Asia/Dubai', 'Asia'],
  ['Singapore', 'Singapore', 'SG', 'Asia/Singapore', 'Asia'],
  ['Sydney', 'Australia', 'AU', 'Australia/Sydney', 'Oceania'],
  ['Auckland', 'New Zealand', 'NZ', 'Pacific/Auckland', 'Oceania'],
].map(([city, country, countryCode, timezone, continent]) => ({
  city, country, countryCode, timezone, continent,
  id: makeId(city, timezone),
}));

export const CITY_CATALOG: CityOption[] = [...DATASET_CITIES, ...COMMON_CITIES]
  .filter((city, index, all) => all.findIndex((item) => item.id === city.id) === index)
  .sort((a, b) => a.city.localeCompare(b.city));

export const DEFAULT_CITIES: CityOption[] = [
  findCity('Pune', 'Asia/Kolkata'),
  findCity('London', 'Europe/London'),
  findCity('New York', 'America/New_York'),
  findCity('Tokyo', 'Asia/Tokyo'),
  findCity('Dubai', 'Asia/Dubai'),
  findCity('Berlin', 'Europe/Berlin'),
].filter((city): city is CityOption => Boolean(city));

export function findCity(city: string, timezone: string): CityOption | undefined {
  const exact = CITY_CATALOG.find((item) => item.timezone === timezone && item.city.toLowerCase() === city.toLowerCase());
  if (exact) return exact;
  return CITY_CATALOG.find((item) => item.timezone === timezone);
}

export function searchCities(query: string, limit = 30): CityOption[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const exactTimezone = CITY_CATALOG.filter((item) => item.timezone.toLowerCase() === normalized);
  const starts = CITY_CATALOG.filter((item) =>
    item.city.toLowerCase().startsWith(normalized)
    || item.country.toLowerCase().startsWith(normalized)
    || item.timezone.toLowerCase().startsWith(normalized),
  );
  const contains = CITY_CATALOG.filter((item) =>
    item.city.toLowerCase().includes(normalized)
    || item.country.toLowerCase().includes(normalized)
    || item.timezone.toLowerCase().includes(normalized),
  );
  return [...new Map([...exactTimezone, ...starts, ...contains].map((item) => [item.id, item])).values()].slice(0, limit);
}

export function countryFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}
