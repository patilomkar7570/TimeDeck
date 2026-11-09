import { useMemo, useState } from 'react';
import { Clock3, GripVertical, Heart, Plus, Search, Star, Sun, Moon, Trash2, Users, X } from 'lucide-react';
import type { AppData, CityOption, SavedCity } from '../types';
import { countryFlag, findCity } from '../lib/catalog';
import { addSavedCity, removeSavedCity, reorderSavedCity, updateSavedCity } from '../lib/cityState';
import { formatDate, formatTime, getOffsetLabel, isDaytime } from '../lib/time';
import { CityPickerModal } from './CityPickerModal';
import { ClockDisplay } from './ClockDisplay';
import { StyledSelect } from './StyledSelect';

interface Props { data: AppData; update: (next: AppData) => void; timestamp: number; }

export function WorldClockPage({ data, update, timestamp }: Props) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All cities');
  const [addOpen, setAddOpen] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showGroupCreator, setShowGroupCreator] = useState(false);

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const localDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
  const homeZone = data.preferences.defaultHomeCity || localZone;
  const homeCity = data.cities.find((city) => city.timezone === homeZone) ?? findCity('Pune', homeZone) ?? data.cities[0];
  const filtered = useMemo(() => data.cities.filter((city) => {
    const matchesGroup = group === 'All cities' || city.group === group;
    const text = `${city.city} ${city.country} ${city.timezone}`.toLowerCase();
    return matchesGroup && text.includes(query.toLowerCase());
  }), [data.cities, group, query]);
  const favorites = filtered.filter((city) => city.favorite);

  const updateCity = (id: string, patch: Partial<SavedCity>) => update(updateSavedCity(data, id, patch));
  const addCity = (city: CityOption) => {
    if (data.cities.some((saved) => saved.id === city.id)) return;
    update(addSavedCity(data, city, group === 'All cities' ? 'All cities' : group));
    setAddOpen(false);
  };
  const removeCity = (id: string) => update(removeSavedCity(data, id));
  const reorder = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    update(reorderSavedCity(data, draggedId, targetId));
    setDraggedId(null);
  };
  const createGroup = () => {
    const name = newGroup.trim();
    if (!name || data.groups.some((item) => item.toLowerCase() === name.toLowerCase())) return;
    update({ ...data, groups: [...data.groups, name] });
    setGroup(name); setNewGroup(''); setShowGroupCreator(false);
  };

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">YOUR TIME · YOUR WORLD</div>
          <h1>Good to see you.</h1>
          <p className="page-subtitle">{localDate} <span className="dot-separator">·</span> Your local time is {formatTime(timestamp, localZone, data.preferences.timeFormat, true)}</p>
        </div>
        <button className="button button-primary" onClick={() => setAddOpen(true)}><Plus size={17} /> Add city</button>
      </div>

      <section className="local-time-card">
        <div className="local-time-copy">
          <div className="local-time-label"><span className="live-dot" /> DEFAULT HOME CITY</div>
          <div className="local-time-zone">{homeCity?.city ?? 'Home time'} <span>·</span> {homeZone}</div>
          <div className="local-time-date">{formatDate(timestamp, homeZone, 'long')}</div>
        </div>
        <div className="local-time-value">{formatTime(timestamp, homeZone, data.preferences.timeFormat, true)}</div>
        <div className="local-time-orbit"><span /><span /><span /></div>
      </section>

      <div className="section-heading-row">
        <div><h2>Favourite places</h2><p>Quick-glance clocks for the places that matter.</p></div>
        <span className="count-label"><Star size={13} /> {favorites.length} favourites</span>
      </div>
      {favorites.length === 0 ? (
        <div className="inline-empty"><Heart size={17} /><span>No favourites yet. Tap the heart on a city card to pin it here.</span></div>
      ) : (
        <div className="city-grid city-grid--favorites">
          {favorites.slice(0, 4).map((city) => <CityCard key={`fav-${city.id}`} city={city} data={data} timestamp={timestamp} onFavorite={() => updateCity(city.id, { favorite: !city.favorite })} onRemove={() => removeCity(city.id)} onGroup={(value) => updateCity(city.id, { group: value })} />)}
        </div>
      )}

      <div className="section-heading-row all-cities-heading">
        <div><h2>All cities</h2><p>Your saved time zones, all in one place.</p></div>
      </div>
      <div className="city-toolbar">
        <div className="group-tabs">
          {data.groups.map((item) => <button key={item} className={`group-tab ${group === item ? 'active' : ''}`} onClick={() => setGroup(item)}>{item}</button>)}
          <button className="group-add" aria-label="Create city group" data-tooltip="Create city group" onClick={() => setShowGroupCreator((value) => !value)}><Plus size={14} /></button>
        </div>
        <div className="toolbar-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter saved cities" /></div>
      </div>
      {showGroupCreator && <div className="group-creator"><Users size={15} /><input autoFocus value={newGroup} onChange={(event) => setNewGroup(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && createGroup()} placeholder="New group name" /><button className="button button-small button-primary" onClick={createGroup}>Create group</button><button className="icon-button tiny" onClick={() => setShowGroupCreator(false)} aria-label="Cancel" data-tooltip="Cancel group creation"><X size={14} /></button></div>}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><Clock3 size={22} /></div><h3>{query ? 'No cities match that search' : 'No cities in this group yet'}</h3><p>{query ? 'Try a different city, country, or timezone.' : 'Add a place to start building your world clock.'}</p>{!query && <button className="button button-secondary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add your first city</button>}</div>
      ) : (
        <div className="city-grid">
          {filtered.map((city) => <div key={city.id} draggable onDragStart={() => setDraggedId(city.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(city.id)} onDragEnd={() => setDraggedId(null)} className={draggedId === city.id ? 'dragging' : ''}>
            <CityCard city={city} data={data} timestamp={timestamp} onFavorite={() => updateCity(city.id, { favorite: !city.favorite })} onRemove={() => removeCity(city.id)} onGroup={(value) => updateCity(city.id, { group: value })} dragHandle />
          </div>)}
        </div>
      )}

      {addOpen && <CityPickerModal title="Add a city" description="Search cities, countries and IANA timezones." onClose={() => setAddOpen(false)} onSelect={addCity} excludeIds={data.cities.map((city) => city.id)} footnote="Times are calculated locally. No connection required." />}
    </div>
  );
}

function CityCard({ city, data, timestamp, onFavorite, onRemove, onGroup, dragHandle = false }: { city: SavedCity; data: AppData; timestamp: number; onFavorite: () => void; onRemove: () => void; onGroup: (value: string) => void; dragHandle?: boolean }) {
  const day = isDaytime(timestamp, city.timezone);
  const isAnalog = data.preferences.clockStyle === 'analog';
  return (
    <article className="city-card">
      <div className="city-card-top">
        <div className="city-identity"><span className="city-flag">{countryFlag(city.countryCode)}</span><div><h3>{city.city}</h3><p>{city.country}</p></div></div>
        <div className="city-actions">
          {dragHandle && <span className="drag-indicator" data-tooltip="Drag to reorder"><GripVertical size={16} /></span>}
          <button className={`icon-button tiny ${city.favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={city.favorite ? 'Remove favourite' : 'Add to favourites'} data-tooltip={city.favorite ? 'Remove favourite' : 'Add to favourites'}><Heart size={15} fill={city.favorite ? 'currentColor' : 'none'} /></button>
          <button className="icon-button tiny" onClick={onRemove} aria-label={`Remove ${city.city}`} data-tooltip="Remove city"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="city-clock-row">
        {isAnalog && <ClockDisplay timestamp={timestamp} timezone={city.timezone} format={data.preferences.timeFormat} style="analog" />}
        <div className="city-clock-content">{!isAnalog && <ClockDisplay timestamp={timestamp} timezone={city.timezone} format={data.preferences.timeFormat} style="digital" />}<div className="city-date">{formatDate(timestamp, city.timezone, 'long')}</div></div>
      </div>
      <div className="city-card-footer"><span className={`day-indicator ${day ? 'day' : 'night'}`}>{day ? <Sun size={12} /> : <Moon size={12} />}{day ? 'Daytime' : 'Nighttime'}</span><span className="offset-label">{getOffsetLabel(timestamp, city.timezone)}</span><StyledSelect compact placement="top" className="city-group-select" ariaLabel={`Move ${city.city} to group`} value={city.group} onChange={onGroup} options={data.groups.map((group) => ({ value: group, label: group }))} /></div>
    </article>
  );
}
