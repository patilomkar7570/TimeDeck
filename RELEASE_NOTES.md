# TimeDeck v1.0.0

The first stable release of TimeDeck: a focused, local-first world clock and time-zone utility with a polished installable web-app experience.

## Included

- **World Clock:** save and organize cities, mark favourites, reorder cards, and use digital or analog clocks.
- **Compare Time:** explore a 24-hour timeline across multiple time zones, including local date and day/night differences.
- **Time Converter:** convert a source date and time into multiple destinations with daylight-saving ambiguity and nonexistent-time handling.
- **Settings:** automatic, dark and light appearance, accent colours, clock preferences, and local import/export.
- Bundled city/timezone search using IANA timezone identifiers and timezone-aware runtime calculations.
- Installable PWA with offline application-shell caching.
- Local-only preferences and saved cities; no account, cloud backend, advertisements or telemetry.
- Windows launchers for a regular Brave tab, standalone Brave app-style window, and local development.

## Windows launchers

- `Start-TimeDeck-Web.bat` opens the hosted website in a normal Brave tab.
- `Start-TimeDeck-App.bat` opens the hosted PWA in a standalone Brave app-style window.
- `Start-TimeDeck-Web-Local.bat` and `Start-TimeDeck-App-Local.bat` run the local Vite development version.

The standalone Brave window is not an Electron executable or Windows installer. See [README.md](README.md) for requirements, development instructions and PWA installation details.
