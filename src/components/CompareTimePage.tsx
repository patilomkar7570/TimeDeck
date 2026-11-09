import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, Plus, RotateCcw, X } from 'lucide-react';
import type { AppData, CityOption } from '../types';
import { CityPickerModal } from './CityPickerModal';
import { countryFlag } from '../lib/catalog';
import { addSavedCity } from '../lib/cityState';
import { describeDayDifference, formatDate, formatTime, getDayDifference, getOffsetLabel, getZonedDateParts, isDaytime } from '../lib/time';

interface Props { data: AppData; update: (next: AppData) => void; timestamp: number; }

export function CompareTimePage({ data, update, timestamp }: Props) {
  const initial = new Date(timestamp);
  const [referenceDate, setReferenceDate] = useState(new Date(Date.UTC(initial.getUTCFullYear(), initial.getUTCMonth(), initial.getUTCDate())).toISOString().slice(0, 10));
  const [minute, setMinute] = useState(initial.getUTCHours() * 60 + initial.getUTCMinutes());
  const [selected, setSelected] = useState<string[]>(() => data.cities.slice(0, 5).map((city) => city.id));
  const [addOpen, setAddOpen] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);

  const anchor = useMemo(() => {
    const [year, month, day] = referenceDate.split('-').map(Number);
    return Date.UTC(year, month - 1, day, 0, minute);
  }, [referenceDate, minute]);
  const chosenCities = selected.map((id) => data.cities.find((city) => city.id === id)).filter((city): city is NonNullable<typeof city> => Boolean(city));
  const ticks = showAllHours ? Array.from({ length: 25 }, (_, index) => index) : Array.from({ length: 13 }, (_, index) => index * 2);

  const addCity = (city: CityOption) => {
    if (selected.includes(city.id)) return;
    if (!data.cities.some((item) => item.id === city.id)) update(addSavedCity(data, city));
    setSelected((current) => [...current, city.id]); setAddOpen(false);
  };
  const removeCity = (id: string) => setSelected((current) => current.filter((item) => item !== id));
  const setCurrent = () => {
    const now = new Date();
    setReferenceDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().slice(0, 10));
    setMinute(now.getUTCHours() * 60 + now.getUTCMinutes());
  };

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">SIDE BY SIDE, SECOND BY SECOND</div><h1>Compare time.</h1><p className="page-subtitle">See how a single moment lands around the world.</p></div><button className="button button-secondary" onClick={setCurrent}><RotateCcw size={15} /> Now</button></div>

      <section className="compare-control-card">
        <div className="compare-control-top"><div><span className="control-label"><Clock3 size={14} /> SELECTED MOMENT</span><strong>{formatTime(anchor, 'UTC', '24h', true)} <small>UTC</small></strong><span className="compare-date">{new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', dateStyle: 'full' }).format(anchor)}</span></div><label className="date-control"><CalendarDays size={15} /><span>UTC reference date</span><input type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} /></label></div>
        <div className="timeline-slider-wrap"><div className="timeline-slider-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div><input className="timeline-slider" type="range" min={0} max={1439} step={1} value={minute} onChange={(event) => setMinute(Number(event.target.value))} aria-label="Move through the selected UTC day" style={{ background: `linear-gradient(90deg, var(--accent) ${(minute / 1439) * 100}%, var(--border) ${(minute / 1439) * 100}%)` }} /><div className="timeline-slider-caption">Drag the handle to move through the day · all city clocks update together</div></div>
      </section>

      <div className="section-heading-row"><div><h2>Time across your cities</h2><p>Local clock positions on a 24-hour day.</p></div><div className="compare-actions"><button className="text-button" onClick={() => setShowAllHours((value) => !value)}>{showAllHours ? 'Fewer labels' : 'Show every hour'}</button><button className="button button-primary button-small" onClick={() => setAddOpen(true)}><Plus size={15} /> Add city</button></div></div>

      {chosenCities.length === 0 ? <div className="empty-state"><div className="empty-icon"><Clock3 size={22} /></div><h3>Add places to compare</h3><p>Select two or more cities to see their local times together.</p><button className="button button-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add a city</button></div> : (
        <section className="comparison-board">
          <div className="timeline-axis"><div className="axis-title">CITY / TIMEZONE</div><div className="axis-hours">{ticks.map((hour) => <span key={hour} style={{ left: `${(hour / 24) * 100}%` }}>{String(hour).padStart(2, '0')}{hour === 24 ? ':00' : ''}</span>)}</div></div>
          {chosenCities.map((city) => {
            const parts = getZonedDateParts(anchor, city.timezone);
            const localMinute = parts.hour * 60 + parts.minute + parts.second / 60;
            const position = (localMinute / 1440) * 100;
            const diff = getDayDifference(anchor, city.timezone, 'UTC');
            const day = isDaytime(anchor, city.timezone);
            return <div className="comparison-row" key={city.id}>
              <div className="comparison-city"><span className="flag">{countryFlag(city.countryCode)}</span><span className="comparison-city-name"><strong>{city.city}</strong><small>{city.timezone}</small></span><button className="icon-button tiny row-remove" onClick={() => removeCity(city.id)} aria-label={`Remove ${city.city}`} data-tooltip="Remove city"><X size={14} /></button></div>
              <div className="comparison-track-area"><div className="comparison-track"><div className="track-night" /><div className="track-day" /><div className="track-hours">{ticks.map((hour) => <span key={hour} style={{ left: `${(hour / 24) * 100}%` }} />)}</div><div className={`time-marker ${day ? 'is-day' : 'is-night'}`} style={{ left: `${position}%` }}><span className="marker-dot" /><span className="marker-time">{formatTime(anchor, city.timezone, data.preferences.timeFormat)}</span></div></div><div className="comparison-meta"><span className="comparison-full-time">{formatTime(anchor, city.timezone, data.preferences.timeFormat, true)}</span><span>{formatDate(anchor, city.timezone, 'long')}</span><span className="offset-label">{getOffsetLabel(anchor, city.timezone)}</span><span className="date-difference">{describeDayDifference(diff)}</span></div></div>
            </div>;
          })}
          <div className="comparison-legend"><span><i className="legend-dot day" /> Approx. daytime (06:00–18:00)</span><span><i className="legend-dot night" /> Nighttime</span><span className="legend-note">Markers show local clock position; labels show the exact date and time.</span></div>
        </section>
      )}

      <div className="compare-note"><span className="live-dot" /> The timeline is anchored to a UTC day. Local time, offset and date differences are calculated from each city's IANA timezone, including daylight-saving rules.</div>
      {addOpen && <CityPickerModal title="Add comparison city" description="Choose a saved city or search the full catalogue." onClose={() => setAddOpen(false)} onSelect={addCity} excludeIds={selected} />}
    </div>
  );
}
