import { useEffect, useRef, useState } from 'react';
import { Check, Clock3, Search, X } from 'lucide-react';
import type { CityOption } from '../types';
import { countryFlag, searchCities } from '../lib/catalog';
import { getOffsetLabel } from '../lib/time';

interface CityPickerProps {
  onSelect: (city: CityOption) => void;
  excludeIds?: string[];
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export function CityPicker({ onSelect, excludeIds = [], placeholder = 'Search cities, countries, or timezones…', compact = false, autoFocus = false }: CityPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchCities(query).filter((city) => !excludeIds.includes(city.id));

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, []);

  return (
    <div className={`city-picker ${compact ? 'city-picker--compact' : ''}`} ref={wrapperRef}>
      <div className={`picker-input-wrap ${open ? 'is-open' : ''}`}>
        <Search size={16} />
        <input
          ref={inputRef}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key === 'Enter' && results[0]) {
              onSelect(results[0]); setQuery(''); setOpen(false);
            }
          }}
          aria-label="Search city catalogue"
        />
        {query && <button className="icon-button tiny" onClick={() => setQuery('')} aria-label="Clear search" data-tooltip="Clear search"><X size={14} /></button>}
      </div>
      {open && query.trim() && (
        <div className="picker-results" role="listbox">
          {results.length === 0 ? <div className="picker-empty">No matching cities found.</div> : results.map((city) => (
            <button key={city.id} className="picker-result" onClick={() => { onSelect(city); setQuery(''); setOpen(false); }}>
              <span className="flag">{countryFlag(city.countryCode)}</span>
              <span className="picker-result-main"><strong>{city.city}</strong><small>{city.country}</small></span>
              <span className="picker-result-zone"><small>{city.timezone}</small><small><Clock3 size={11} /> {getOffsetLabel(Date.now(), city.timezone)}</small></span>
              <Check className="picker-result-check" size={15} />
            </button>
          ))}
          {results.length > 0 && <div className="picker-footer">{results.length} matching {results.length === 1 ? 'city' : 'cities'} · bundled timezone catalogue</div>}
        </div>
      )}
    </div>
  );
}
