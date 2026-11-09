# TimeDeck

**Your World, At a Glance.**

[![MIT License](https://img.shields.io/badge/License-MIT-8B7CFF.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-6757E8)](https://web.dev/learn/pwa/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**Explore global time with live city clocks, interactive time-zone comparisons, and effortless date and time conversions—all in one beautiful, easy-to-use application.**

TimeDeck is a local-first world clock and time-zone utility built as a responsive Progressive Web App. It brings four focused tools together: World Clock, Compare Time, Time Converter and Settings.

## Explore TimeDeck

- **World Clock** — Search a bundled city catalogue, save cities, mark favourites, organize groups, reorder cards, and choose digital or analog clocks.
- **Compare Time** — Move along a 24-hour timeline to compare local times, day/night periods and date differences across cities.
- **Time Converter** — Convert a selected local date and time across multiple destinations, with explicit handling for daylight-saving gaps and overlaps.
- **Settings** — Follow system appearance automatically or choose dark/light mode, customize accent colours and clock preferences, and export or import local configuration.

## Highlights

- Search by city, country or IANA time-zone identifier using bundled `@vvo/tzdb` data.
- Calculate time dynamically with IANA zones, `Intl.DateTimeFormat` and the Temporal polyfill—not hard-coded UTC offsets.
- Responsive desktop, tablet and mobile layouts.
- Installable PWA with a cached offline application shell after the first successful load.
- Theme-aware custom tooltips, menus and city picker.
- Local-first storage: saved cities, groups and preferences remain in the current browser profile.
- No accounts, cloud backend, ads, mandatory telemetry or external time API.

## Use TimeDeck

**Website:** [https://patilomkar7570.github.io/TimeDeck/](https://patilomkar7570.github.io/TimeDeck/)

When GitHub Pages is enabled and its deployment workflow has completed, open the website in a supported browser. You can also install the PWA from the browser's install option for an app-style window.

### Windows launch shortcuts

The repository includes two optional Brave launchers:

| File | Behaviour |
|---|---|
| `Start-TimeDeck-Web.bat` | Opens the hosted site in a normal Brave tab. |
| `Start-TimeDeck-App.bat` | Opens the same hosted site in a standalone Brave app window. |
| `Start-TimeDeck-Web-Local.bat` | Starts the local Vite server and opens a normal Brave tab. |
| `Start-TimeDeck-App-Local.bat` | Starts the local Vite server and opens a standalone Brave app window. |

The hosted shortcuts require the GitHub Pages URL to be deployed first. The standalone Brave window is an app-style browser window, not a separate Electron executable. Both hosted launchers use the same Brave profile and therefore share browser storage.

### Run locally

Requirements: Node.js 20.19+ and npm.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

Run checks and create a production build:

```powershell
npm run typecheck
npm test
npm run build
npm run preview
```

The production output is written to `dist/`.

## Publish with GitHub Pages

The repository includes `.github/workflows/pages.yml`, which builds the PWA and deploys the `dist/` directory to GitHub Pages.

1. In the repository, open **Settings → Pages**.
2. Set the build and deployment source to **GitHub Actions**.
3. Ensure Actions are permitted to write the Pages deployment artifact (the workflow declares the required permissions).
4. Push to `main` or run the workflow manually from **Actions**.
5. Once the workflow succeeds, open the website link above.

## Time-zone accuracy

The computer's system clock is the source of the current timestamp. Each city's IANA time-zone identifier supplies the rules used to calculate its local date, time and UTC offset. Temporal helps identify local times that are ambiguous or nonexistent during daylight-saving transitions.

Time-zone rules are provided by the browser/runtime. Keep the browser updated for current timezone database rules. An inaccurate operating-system clock can produce inaccurate displayed times.

## Privacy and data

TimeDeck stores saved cities, groups and preferences locally in the current browser profile. Data does not sync between browsers or devices automatically. Export a JSON backup from Settings before clearing browser data or moving to another device.

## Project structure

```text
.
├── .github/              # CI, Pages deployment and issue templates
├── public/               # PWA manifest, icons and static assets
├── scripts/              # Service worker and Windows launch scripts
├── src/
│   ├── components/       # World Clock, Compare, Converter and Settings
│   ├── lib/              # Time-zone, city catalogue and storage logic
│   ├── styles/
│   └── types/
├── tests/
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── RELEASE_NOTES.md
└── SECURITY.md
```

## Contributing

Focused bug reports, accessibility feedback and improvements are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and keep the product centred on its four core tools.

## Security

Please see [SECURITY.md](SECURITY.md) for responsible vulnerability disclosure.

## License

TimeDeck is released under the [MIT License](LICENSE).
