# Changelog

All notable TimeDeck changes are documented here.

## [1.0.0] - 2026-11-10

This is the first stable release of TimeDeck.

### Added
- **World Clock:** save cities, mark favourites, organize groups, reorder cards and switch between digital and analog clocks.
- **Compare Time:** explore a 24-hour timeline and compare local times, dates and day/night periods across selected cities.
- **Time Converter:** convert a selected local date and time into multiple destination time zones, including daylight-saving overlap and gap handling.
- **Settings:** automatic, dark and light themes; accent colours; clock format and style; and local configuration import/export.
- Bundled searchable city and timezone catalogue using IANA identifiers, with timezone-aware calculations through `Intl.DateTimeFormat` and the Temporal polyfill.
- Installable Progressive Web App with an offline-cached application shell.
- Local-first storage with no account, cloud backend, advertisements or telemetry.
- Windows launchers for a normal Brave tab, a standalone Brave app-style window, and local development.
- GitHub Actions workflows for continuous integration and GitHub Pages deployment.

### Design and usability
- Theme-aware tooltips, dropdowns and city-picker interactions.
- Responsive layout and keyboard-friendly controls across the four focused sections.

### Platform notes
- The hosted application runs as a PWA in a supported browser. The standalone Brave launcher opens an app-style browser window; it is not an Electron executable or Windows installer.
- Accurate displayed time depends on the computer's system clock and the timezone database supplied by the browser/runtime.
