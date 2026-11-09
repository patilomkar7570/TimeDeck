import type { AppData, CityOption, SavedCity } from '../types';

export function addSavedCity(data: AppData, city: CityOption, group = 'All cities', now = Date.now()): AppData {
  if (data.cities.some((item) => item.id === city.id)) return data;
  const saved: SavedCity = { ...city, favorite: false, group, addedAt: now };
  return { ...data, cities: [...data.cities, saved] };
}

export function removeSavedCity(data: AppData, id: string): AppData {
  return { ...data, cities: data.cities.filter((city) => city.id !== id) };
}

export function updateSavedCity(data: AppData, id: string, patch: Partial<SavedCity>): AppData {
  return { ...data, cities: data.cities.map((city) => city.id === id ? { ...city, ...patch } : city) };
}

export function reorderSavedCity(data: AppData, draggedId: string, targetId: string): AppData {
  if (draggedId === targetId) return data;
  const cities = [...data.cities];
  const from = cities.findIndex((city) => city.id === draggedId);
  const to = cities.findIndex((city) => city.id === targetId);
  if (from < 0 || to < 0) return data;
  const [moved] = cities.splice(from, 1);
  if (!moved) return data;
  cities.splice(to, 0, moved);
  return { ...data, cities };
}
