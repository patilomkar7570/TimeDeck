import { describe, expect, it } from 'vitest';
import { addSavedCity, removeSavedCity, reorderSavedCity, updateSavedCity } from '../src/lib/cityState';
import { createDefaultData } from '../src/lib/storage';
import { findCity } from '../src/lib/catalog';

describe('saved city management', () => {
  it('adds a city only once', () => {
    const data = createDefaultData();
    const city = findCity('Paris', 'Europe/Paris')!;
    const once = addSavedCity(data, city, 'Work', 123);
    expect(once.cities).toHaveLength(data.cities.length + 1);
    expect(once.cities.find((item) => item.id === city.id)?.group).toBe('Work');
    expect(addSavedCity(once, city).cities).toHaveLength(data.cities.length + 1);
  });

  it('updates favourites and removes a saved city', () => {
    const data = createDefaultData();
    const id = data.cities[0].id;
    const fav = updateSavedCity(data, id, { favorite: true });
    expect(fav.cities.find((city) => city.id === id)?.favorite).toBe(true);
    expect(removeSavedCity(fav, id).cities.some((city) => city.id === id)).toBe(false);
  });

  it('reorders cities without losing any entries', () => {
    const data = createDefaultData();
    const [first, second] = data.cities;
    const reordered = reorderSavedCity(data, first.id, second.id);
    expect(reordered.cities[0].id).toBe(second.id);
    expect(reordered.cities).toHaveLength(data.cities.length);
  });
});
