import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Clock3, Download, Globe2, Moon, Settings2, Sun, Timer, Sparkles } from 'lucide-react';
import type { AppData, Section } from './types';
import { loadData, saveData } from './lib/storage';
import { APP_VERSION } from './lib/appConfig';
import { WorldClockPage } from './components/WorldClockPage';
import { CompareTimePage } from './components/CompareTimePage';
import { TimeConverterPage } from './components/TimeConverterPage';
import { SettingsPage } from './components/SettingsPage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const NAV_ITEMS: { id: Section; label: string; icon: typeof Clock3; hint: string }[] = [
  { id: 'world-clock', label: 'World Clock', icon: Globe2, hint: 'Your saved places' },
  { id: 'compare-time', label: 'Compare Time', icon: ArrowLeftRight, hint: 'One moment, many zones' },
  { id: 'time-converter', label: 'Time Converter', icon: Timer, hint: 'Convert with confidence' },
  { id: 'settings', label: 'Settings', icon: Settings2, hint: 'Make it yours' },
];

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [activeSection, setActiveSection] = useState<Section>(() => data.preferences.rememberSection ? data.preferences.lastSection : 'world-clock');
  const [timestamp, setTimestamp] = useState(() => Date.now());
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true);
  const [sidebarOpen, setSidebarOpen] = useState(!data.preferences.sidebarCollapsed);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => window.matchMedia?.('(display-mode: standalone)').matches ?? false);

  useEffect(() => {
    const timer = window.setInterval(() => setTimestamp(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try { saveData(data); } catch (error) { console.warn('TimeDeck could not persist local preferences.', error); }
    document.documentElement.dataset.theme = data.preferences.theme === 'system' ? (systemDark ? 'dark' : 'light') : data.preferences.theme;
    document.documentElement.style.setProperty('--accent', data.preferences.accent);
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(data.preferences.accent));
  }, [data, systemDark]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => setSidebarOpen(!data.preferences.sidebarCollapsed), [data.preferences.sidebarCollapsed]);

  useEffect(() => {
    if (data.preferences.rememberSection && data.preferences.lastSection !== activeSection) {
      setData((current) => ({ ...current, preferences: { ...current.preferences, lastSection: activeSection } }));
    }
  }, [activeSection, data.preferences.lastSection, data.preferences.rememberSection]);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setIsInstalled(true); setInstallPrompt(null); };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const currentSection = useMemo(() => NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0], [activeSection]);
  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    setData((current) => ({ ...current, preferences: { ...current.preferences, sidebarCollapsed: !next } }));
  };
  const toggleTheme = () => {
    const effectiveDark = data.preferences.theme === 'system' ? systemDark : data.preferences.theme === 'dark';
    setData((current) => ({ ...current, preferences: { ...current.preferences, theme: effectiveDark ? 'light' : 'dark' } }));
  };
  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark"><span>T</span><i /></div>
          {sidebarOpen && <div className="brand-copy"><strong>TimeDeck</strong><span>Your World, At a Glance.</span></div>}
          <button className="sidebar-collapse" onClick={toggleSidebar} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} data-tooltip={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} data-tooltip-side="right"><span>{sidebarOpen ? '‹' : '›'}</span></button>
        </div>
        <div className="sidebar-section-label">YOUR WORKSPACE</div>
        <nav className="primary-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon, hint }) => <button key={id} onClick={() => setActiveSection(id)} className={`nav-item ${activeSection === id ? 'active' : ''}`} data-tooltip={!sidebarOpen ? `${label} — ${hint}` : undefined} data-tooltip-side="right" aria-current={activeSection === id ? 'page' : undefined}><span className="nav-icon"><Icon size={18} strokeWidth={1.8} /></span>{sidebarOpen && <><span className="nav-label">{label}</span>{activeSection === id && <span className="nav-active-indicator" />}</>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          {sidebarOpen && <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={14} /></div><div><strong>Time, in sync.</strong><span>Precise by timezone. Private by design.</span></div></div>}
          <div className="sidebar-version"><span className="version-dot" />{sidebarOpen && <span>TimeDeck <b>v{APP_VERSION}</b></span>}</div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-leading"><div className="breadcrumb"><span>TimeDeck</span><span className="breadcrumb-divider">/</span><strong>{currentSection.label}</strong></div></div>
          <div className="topbar-trailing"><div className="topbar-status"><span className="live-dot" /> <span>Local clock</span></div>{installPrompt && !isInstalled && <button className="button button-primary button-small install-topbar" onClick={() => void installApp()}><Download size={14} /> Install</button>}<button className="icon-button theme-toggle" onClick={toggleTheme} data-tooltip="Toggle dark and light theme" aria-label="Toggle theme">{(data.preferences.theme === 'system' ? systemDark : data.preferences.theme === 'dark') ? <Sun size={17} /> : <Moon size={17} />}</button></div>
        </header>
        <div className="content-scroll" key={activeSection}>
          {activeSection === 'world-clock' && <WorldClockPage data={data} update={setData} timestamp={timestamp} />}
          {activeSection === 'compare-time' && <CompareTimePage data={data} update={setData} timestamp={timestamp} />}
          {activeSection === 'time-converter' && <TimeConverterPage data={data} update={setData} timestamp={timestamp} />}
          {activeSection === 'settings' && <SettingsPage data={data} update={setData} installAvailable={Boolean(installPrompt) && !isInstalled} isInstalled={isInstalled} onInstall={() => void installApp()} />}
        </div>
        <footer className="app-footer"><span>{currentSection.hint}</span><span>Device clock <i>·</i> Local-only data</span></footer>
      </main>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '');
  const normalized = value.length === 3 ? [...value].map((char) => char + char).join('') : value;
  const number = Number.parseInt(normalized, 16);
  if (!Number.isFinite(number)) return '139, 124, 255';
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}
