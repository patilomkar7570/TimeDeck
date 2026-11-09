import { useRef, useState } from 'react';
import { Check, Download, FileUp, Moon, Palette, RotateCcw, Sun, Monitor, Clock3, ShieldCheck, Info, Smartphone, ExternalLink } from 'lucide-react';
import type { AppData, ClockStyle, ThemeMode, TimeFormat } from '../types';
import { CITY_CATALOG, DEFAULT_CITIES } from '../lib/catalog';
import { createDefaultData, validateImport } from '../lib/storage';
import type { CSSProperties } from 'react';
import { StyledSelect } from './StyledSelect';
import { APP_VERSION } from '../lib/appConfig';

interface Props {
  data: AppData;
  update: (next: AppData) => void;
  installAvailable: boolean;
  isInstalled: boolean;
  onInstall: () => void;
}
const ACCENTS = ['#8B7CFF', '#6757E8', '#41A6D9', '#24A88A', '#D78A4B', '#D66C93', '#E0B64C'];
const HOME_CITY_OPTIONS = [...DEFAULT_CITIES, ...CITY_CATALOG].filter((city, index, all) => all.findIndex((item) => item.timezone === city.timezone) === index);

export function SettingsPage({ data, update, installAvailable, isInstalled, onInstall }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState('');
  const preferences = data.preferences;
  const updatePreference = <K extends keyof typeof preferences>(key: K, value: typeof preferences[K]) => update({ ...data, preferences: { ...preferences, [key]: value } });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `timedeck-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Your TimeDeck backup is ready. Keep the JSON file somewhere safe.');
  };

  const importData = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = validateImport(JSON.parse(await file.text()));
      update(parsed);
      setNotice(`Imported ${parsed.cities.length} cities, ${parsed.groups.length} groups and your preferences.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not read this backup.');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const reset = () => {
    if (!window.confirm('Reset TimeDeck to its default settings? Your saved cities, groups and preferences will be replaced.')) return;
    update(createDefaultData());
    setNotice('TimeDeck has been reset to its default configuration.');
  };

  return (
    <div className="page-content settings-page">
      <div className="welcome-row"><div><div className="eyebrow">MAKE IT FEEL LIKE YOURS</div><h1>Settings.</h1><p className="page-subtitle">A few thoughtful controls. Your preferences stay on this device.</p></div></div>
      {notice && <div className="settings-notice" role="status"><Check size={15} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss" data-tooltip="Dismiss notice"><span>×</span></button></div>}

      <div className="settings-layout">
        <section className="settings-section">
          <div className="settings-section-heading"><span className="settings-icon"><Palette size={17} /></span><div><h2>Appearance</h2><p>Set the tone for your workspace.</p></div></div>
          <div className="settings-control"><div className="control-copy"><strong>Theme</strong><span>Auto follows your device's appearance.</span></div><div className="theme-options">{([['dark', Moon, 'Dark'], ['light', Sun, 'Light'], ['system', Monitor, 'Auto']] as const).map(([value, Icon, label]) => <button key={value} className={`theme-option ${preferences.theme === value ? 'selected' : ''}`} onClick={() => updatePreference('theme', value as ThemeMode)}><Icon size={16} /><span>{label}</span>{preferences.theme === value && <Check size={13} />}</button>)}</div></div>
          <div className="settings-control"><div className="control-copy"><strong>Accent colour</strong><span>Choose a small pop of personality.</span></div><div className="accent-options">{ACCENTS.map((accent) => <button key={accent} className={`accent-swatch ${preferences.accent === accent ? 'selected' : ''}`} style={{ '--swatch': accent } as CSSProperties & { '--swatch': string }} onClick={() => updatePreference('accent', accent)} aria-label={`Set accent ${accent}`} data-tooltip={`Accent ${accent}`}>{preferences.accent === accent && <Check size={14} />}</button>)}</div></div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading"><span className="settings-icon"><Clock3 size={17} /></span><div><h2>Clock preferences</h2><p>Make every clock read the way you like.</p></div></div>
          <div className="settings-control"><div className="control-copy"><strong>Time format</strong><span>Choose a 12-hour or 24-hour clock.</span></div><div className="segmented-control"><button className={preferences.timeFormat === '12h' ? 'active' : ''} onClick={() => updatePreference('timeFormat', '12h' as TimeFormat)}>12-hour</button><button className={preferences.timeFormat === '24h' ? 'active' : ''} onClick={() => updatePreference('timeFormat', '24h' as TimeFormat)}>24-hour</button></div></div>
          <div className="settings-control"><div className="control-copy"><strong>Clock style</strong><span>Choose the look for city cards.</span></div><div className="segmented-control"><button className={preferences.clockStyle === 'digital' ? 'active' : ''} onClick={() => updatePreference('clockStyle', 'digital' as ClockStyle)}>Digital</button><button className={preferences.clockStyle === 'analog' ? 'active' : ''} onClick={() => updatePreference('clockStyle', 'analog' as ClockStyle)}>Analog</button></div></div>
          <div className="settings-control"><div className="control-copy"><strong>Default home city</strong><span>Used for your home-time reference.</span></div><StyledSelect className="settings-select-control" value={preferences.defaultHomeCity} onChange={(value) => updatePreference('defaultHomeCity', value)} ariaLabel="Default home city" options={HOME_CITY_OPTIONS.map((city) => ({ value: city.timezone, label: `${city.city}, ${city.country}`, description: city.timezone }))} /></div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading"><span className="settings-icon"><Smartphone size={17} /></span><div><h2>App experience</h2><p>Use TimeDeck on the devices you already own.</p></div></div>
          <div className="data-action"><div><strong>{isInstalled ? 'TimeDeck is installed' : 'Install TimeDeck'}</strong><span>{isInstalled ? 'You are using the standalone app window.' : 'Install it on your desktop or phone for an app-like window and quick access.'}</span></div><button className="button button-primary button-small" onClick={onInstall} disabled={!installAvailable || isInstalled}><Download size={14} /> {isInstalled ? 'Installed' : installAvailable ? 'Install app' : 'Not available yet'}</button></div>
          {!isInstalled && !installAvailable && <p className="install-hint">For PWA installation, use the deployed HTTPS site or a production preview (`npm run build` then `npm run preview`). In Chrome or Edge, use the install icon or browser menu. On iPhone or iPad, use Safari's Share → Add to Home Screen.</p>}
          <SettingToggle title="Remember last selected section" description="Reopen the same TimeDeck section next time." value={preferences.rememberSection} onChange={(value) => updatePreference('rememberSection', value)} />
        </section>

        <section className="settings-section">
          <div className="settings-section-heading"><span className="settings-icon"><ShieldCheck size={17} /></span><div><h2>Data management</h2><p>Your cities and preferences belong to you.</p></div></div>
          <div className="data-action"><div><strong>Export configuration</strong><span>Save cities, groups and settings as a JSON backup.</span></div><button className="button button-secondary button-small" onClick={exportData}><Download size={15} /> Export</button></div>
          <div className="data-action"><div><strong>Import configuration</strong><span>Restore a previous TimeDeck backup.</span></div><button className="button button-secondary button-small" onClick={() => inputRef.current?.click()}><FileUp size={15} /> Import</button><input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={(event) => void importData(event.target.files?.[0])} /></div>
          <div className="data-action data-action--danger"><div><strong>Reset application</strong><span>Restore default cities and preferences.</span></div><button className="button button-danger button-small" onClick={reset}><RotateCcw size={15} /> Reset</button></div>
        </section>

        <section className="settings-section about-section">
          <div className="settings-section-heading"><span className="settings-icon"><Info size={17} /></span><div><h2>About TimeDeck</h2><p>Your World, At a Glance.</p></div></div>
          <div className="about-row"><div className="about-brand-mark">T</div><div><strong>TimeDeck</strong><span>Version {APP_VERSION} · Progressive Web App</span></div><span className="about-status">Local-first</span></div>
          <div className="about-details"><p>Built with React, TypeScript, Vite and the IANA timezone database via @vvo/tzdb. TimeDeck uses your device's system clock as its timestamp source and the browser's timezone data for calculations. An inaccurate device clock can lead to inaccurate displayed times.</p><p>After the first successful load, the app shell and bundled city catalogue are cached for offline use. Saved cities and preferences remain in this browser profile.</p><div className="repo-placeholder">Source code prepared for GitHub <ExternalLink size={13} /></div></div>
        </section>
      </div>
    </div>
  );
}

function SettingToggle({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="settings-control"><div className="control-copy"><strong>{title}</strong><span>{description}</span></div><button role="switch" aria-checked={value} className={`toggle-switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)}><span /></button></div>;
}
