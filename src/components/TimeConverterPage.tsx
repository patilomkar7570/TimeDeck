import { useMemo, useState } from 'react';
import { ArrowDownUp, Check, Clipboard, Copy, Plus, RefreshCw, RotateCcw, X } from 'lucide-react';
import type { AppData, CityOption } from '../types';
import { DEFAULT_CITIES, countryFlag } from '../lib/catalog';
import { describeDayDifference, formatDate, formatTime, getOffsetLabel, resolveLocalTime } from '../lib/time';
import { CityPickerModal } from './CityPickerModal';
import { addSavedCity } from '../lib/cityState';

interface Props { data: AppData; update: (next: AppData) => void; timestamp: number; }

type Choice = 'earlier' | 'later' | null;

export function TimeConverterPage({ data, update, timestamp }: Props) {
  const localZone = data.preferences.defaultHomeCity || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const initialCity = data.cities.find((city) => city.timezone === localZone) ?? data.cities[0] ?? DEFAULT_CITIES[0];
  const [source, setSource] = useState<CityOption>(initialCity);
  const [date, setDate] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: initialCity.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '01';
    return `${get('year')}-${get('month')}-${get('day')}`;
  });
  const [time, setTime] = useState(() => formatTime(timestamp, initialCity.timezone, '24h').replace(/\s?(AM|PM)$/i, '').padStart(5, '0'));
  const [destinations, setDestinations] = useState<CityOption[]>(() => data.cities.filter((city) => city.id !== initialCity.id).slice(0, 4));
  const [addOpen, setAddOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'source' | 'destination'>('destination');
  const [choice, setChoice] = useState<Choice>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const resolution = useMemo(() => {
    try { return resolveLocalTime(date, time, source.timezone); }
    catch { return null; }
  }, [date, time, source.timezone]);
  const resolved = !resolution
    ? null
    : resolution.kind === 'unique'
      ? resolution.value
      : choice === 'earlier'
        ? resolution.earlier
        : choice === 'later'
          ? resolution.later
          : null;
  const validDestinationIds = destinations.map((city) => city.id);

  const addDestination = (city: CityOption) => {
    if (destinations.some((item) => item.id === city.id)) return;
    if (!data.cities.some((item) => item.id === city.id)) update(addSavedCity(data, city));
    setDestinations((current) => [...current, city]); setAddOpen(false);
  };
  const copyText = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id); window.setTimeout(() => setCopied(null), 1500);
    } catch { setCopied('error'); }
  };
  const converted = resolved ? destinations.map((city) => ({
    city,
    zoned: resolved.withTimeZone(city.timezone),
  })) : [];
  const summaryFor = (city: CityOption, zoned: { toString: () => string; epochMilliseconds: number; offset: string }) => `${city.city}, ${city.country}: ${formatTime(zoned.epochMilliseconds, city.timezone, data.preferences.timeFormat)} · ${formatDate(zoned.epochMilliseconds, city.timezone, 'long')} (${zoned.offset})`;

  const swapSourceAndFirst = () => {
    if (!resolved || destinations.length === 0) return;
    const [first, ...rest] = destinations;
    setDestinations([...rest, source]);
    setSource(first);
    const swapped = resolved.withTimeZone(first.timezone);
    setDate(swapped.toPlainDate().toString());
    setTime(`${String(swapped.hour).padStart(2, '0')}:${String(swapped.minute).padStart(2, '0')}`);
    setChoice(null);
  };
  const clear = () => { setDestinations([]); setChoice(null); };
  const allText = converted.map(({ city, zoned }) => summaryFor(city, zoned)).join('\n');
  const resetFields = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: source.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '01';
    setDate(`${get('year')}-${get('month')}-${get('day')}`);
    const currentTime = new Intl.DateTimeFormat('en-GB', { timeZone: source.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(timestamp);
    setTime(currentTime.padStart(5, '0'));
    setChoice(null);
  };

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">MAKE EVERY MINUTE LINE UP</div><h1>Time converter.</h1><p className="page-subtitle">Pick a moment in one place. See what it means everywhere else.</p></div><button className="button button-secondary" onClick={resetFields}><RotateCcw size={15} /> Reset fields</button></div>

      <section className="converter-source-card">
        <div className="converter-card-heading"><div><span className="eyebrow">FROM</span><h2>Source time</h2></div><span className="source-badge">LOCAL CONVERSION</span></div>
        <div className="source-city-block"><span className="flag source-flag">{countryFlag(source.countryCode)}</span><div><strong>{source.city}</strong><span>{source.country} · {source.timezone}</span></div><button className="text-button change-source" onClick={() => { setPickerMode('source'); setAddOpen(true); }}>Change city</button></div>
        <div className="source-input-grid"><label className="field-label">Date<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setChoice(null); }} /></label><label className="field-label">Time<input type="time" value={time} onChange={(event) => { setTime(event.target.value); setChoice(null); }} /></label><div className="source-zone"><span>TIMEZONE</span><strong>{source.timezone}</strong><small>{resolved ? getOffsetLabel(resolved.epochMilliseconds, source.timezone) : resolution ? 'Choose DST resolution' : '—'}</small></div></div>
      </section>

      {resolution?.kind === 'ambiguous' && <div className="dst-alert"><div><strong>This local time occurs twice.</strong><p>When daylight-saving time ends, the clock moves backward. Choose which occurrence you mean before converting.</p></div><div className="dst-actions"><button className={`button button-small ${choice === 'earlier' ? 'button-primary' : 'button-secondary'}`} onClick={() => setChoice('earlier')}>Earlier occurrence · {resolution.earlier.offset}</button><button className={`button button-small ${choice === 'later' ? 'button-primary' : 'button-secondary'}`} onClick={() => setChoice('later')}>Later occurrence · {resolution.later.offset}</button></div></div>}
      {resolution?.kind === 'nonexistent' && <div className="dst-alert dst-alert--warning"><div><strong>This local time does not exist.</strong><p>The clock jumps forward during daylight-saving time. Choose how to resolve it: move to the earlier valid instant or the later valid instant.</p><small>Earlier resolves to {resolution.earlier.toPlainDateTime().toString()} · Later resolves to {resolution.later.toPlainDateTime().toString()}</small></div><div className="dst-actions"><button className={`button button-small ${choice === 'earlier' ? 'button-primary' : 'button-secondary'}`} onClick={() => setChoice('earlier')}>Use earlier resolution</button><button className={`button button-small ${choice === 'later' ? 'button-primary' : 'button-secondary'}`} onClick={() => setChoice('later')}>Use later resolution</button></div></div>}
      {!resolution && <div className="validation-alert">Enter a valid date and time to continue.</div>}

      <div className="converter-results-heading"><div><div className="section-heading-row"><div><h2>Converted times</h2><p>{resolved ? `Same instant · ${source.city} ${formatTime(resolved.epochMilliseconds, source.timezone, data.preferences.timeFormat)}` : 'Choose a valid source moment to see results.'}</p></div></div></div><div className="result-actions"><button className="button button-ghost button-small" onClick={swapSourceAndFirst} disabled={!resolved || destinations.length === 0} data-tooltip="Make the first destination the source"><ArrowDownUp size={14} /> Swap</button><button className="button button-ghost button-small" onClick={() => void copyText(allText, 'all')} disabled={!resolved || destinations.length === 0}><Copy size={14} /> {copied === 'all' ? 'Copied' : 'Copy all'}</button><button className="button button-ghost button-small" onClick={clear} disabled={destinations.length === 0}><RefreshCw size={14} /> Clear</button></div></div>

      {converted.length === 0 ? <div className="empty-state converter-empty"><div className="empty-icon"><ArrowDownUp size={22} /></div><h3>{destinations.length === 0 ? 'Add destination cities' : 'Resolve the source time'}</h3><p>{destinations.length === 0 ? 'Add one or more cities to see the converted local time.' : 'Select an occurrence above to calculate the destination times safely.'}</p>{destinations.length === 0 && <button className="button button-primary" onClick={() => { setPickerMode('destination'); setAddOpen(true); }}><Plus size={16} /> Add destination</button>}</div> : (
        <div className="conversion-list">{converted.map(({ city, zoned }) => {
          const text = summaryFor(city, zoned);
          return <article key={city.id} className="conversion-card"><div className="conversion-city"><span className="flag">{countryFlag(city.countryCode)}</span><div><strong>{city.city}</strong><small>{city.country}</small></div></div><div className="conversion-value"><strong>{formatTime(zoned.epochMilliseconds, city.timezone, data.preferences.timeFormat)}</strong><span>{formatDate(zoned.epochMilliseconds, city.timezone, 'short')} <i>·</i> {new Intl.DateTimeFormat('en-US', { timeZone: city.timezone, weekday: 'long' }).format(zoned.epochMilliseconds)}</span><small>{city.timezone} <i>·</i> {getOffsetLabel(zoned.epochMilliseconds, city.timezone)}</small></div><div className="conversion-card-actions"><span className="day-change">{describeDayDifference(zoned.toPlainDate().since(resolved!.toPlainDate(), { largestUnit: 'days' }).days)}</span><button className="icon-button" onClick={() => void copyText(text, city.id)} data-tooltip="Copy converted time" aria-label={`Copy ${city.city} time`}>{copied === city.id ? <Check size={16} /> : <Clipboard size={16} />}</button><button className="icon-button" onClick={() => setDestinations((current) => current.filter((item) => item.id !== city.id))} data-tooltip="Remove destination" aria-label={`Remove ${city.city}`}><X size={16} /></button></div></article>;
        })}</div>
      )}
      <div className="add-destination-row"><button className="button button-secondary" onClick={() => { setPickerMode('destination'); setAddOpen(true); }}><Plus size={16} /> Add destination city</button><span>All calculations stay on this device.</span></div>
      {copied === 'error' && <div className="toast-error">Clipboard access was unavailable. Check your desktop permissions.</div>}

      {addOpen && <CityPickerModal title={pickerMode === 'source' ? 'Change source city' : 'Add destination'} description="Search by city, country, or IANA timezone." onClose={() => setAddOpen(false)} onSelect={(city) => {
        if (pickerMode === 'source') {
          setSource(city);
          const nowInZone = new Intl.DateTimeFormat('en-CA', { timeZone: city.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
          const get = (type: string) => nowInZone.find((part) => part.type === type)?.value ?? '01';
          setDate(`${get('year')}-${get('month')}-${get('day')}`);
          const nowTime = new Intl.DateTimeFormat('en-GB', { timeZone: city.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(timestamp);
          setTime(nowTime.padStart(5, '0'));
          setChoice(null);
          setAddOpen(false);
        } else addDestination(city);
      }} excludeIds={pickerMode === 'source' ? destinations.map((item) => item.id) : [source.id, ...validDestinationIds]} />}
    </div>
  );
}
