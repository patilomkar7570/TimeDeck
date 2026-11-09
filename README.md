# TimeDeck

**Your World, At a Glance.**

[![Release](https://img.shields.io/github/v/release/patilomkar7570/TimeDeck?display_name=tag)](https://github.com/patilomkar7570/TimeDeck/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-8B7CFF.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/patilomkar7570/TimeDeck/actions/workflows/pages.yml/badge.svg)](https://github.com/patilomkar7570/TimeDeck/actions/workflows/pages.yml)

TimeDeck is a premium, local-first world clock and time-zone utility. It brings live clocks, a visual time comparison timeline and daylight-saving-aware conversions into one focused, installable web application.

## The four tools

- **World Clock** — Save cities, mark favourites, organize groups, reorder cards and switch between digital and analog clocks.
- **Compare Time** — Move across a 24-hour timeline and see the corresponding local time, date and day/night period in every selected city.
- **Time Converter** — Convert a chosen date and local time to multiple destinations. Ambiguous and nonexistent daylight-saving times are surfaced for the user to resolve.
- **Settings** — Automatic, dark and light themes; accent colours; clock format and style; local configuration import/export; PWA installation guidance.

## Highlights

- Search cities, countries and IANA timezone identifiers from the bundled `@vvo/tzdb` catalogue.
- Calculate live local times and UTC offsets dynamically using IANA time zones, `Intl.DateTimeFormat` and the Temporal polyfill.
- Follow the operating-system appearance automatically, or choose a manual theme.
- Use custom, theme-aware tooltips and dropdowns instead of browser-native white hover boxes.
- Install as a Progressive Web App on supported browsers and use the cached application shell offline after the first successful load.
- Keep saved cities and preferences on the device. No account, cloud backend, advertisements or telemetry.

## Two Windows launch options

After the GitHub Pages deployment is live, the two primary launch files open the same hosted TimeDeck PWA in different presentations. They use the same Brave profile and therefore share the same saved cities and settings:

| File | Opens as | Use it when |
|---|---|---|
| `Start-TimeDeck-Web.bat` | A normal Brave tab with address bar and tabs | You want the regular website experience. |
| `Start-TimeDeck-App.bat` | A clean, standalone Brave app window (`--app` mode) | You want TimeDeck to feel like its own desktop application. |

For local development, use `Start-TimeDeck-Web-Local.bat` or `Start-TimeDeck-App-Local.bat`. They start Vite on `http://127.0.0.1:5173/`; the first local launch installs npm dependencies and needs internet access. `run.bat` remains a compatibility shortcut for local web mode. Local launchers need Node.js 20.19+ and npm.

The standalone Brave launcher is an app-style browser window, not an Electron executable or Windows installer. For a fully installed PWA shortcut, open the hosted site in Brave and use **Install TimeDeck** / **Create shortcut** from the browser menu where available. The installed PWA can then launch directly from the Windows Start Menu.

## Publish to GitHub

The repository publishing helper targets the existing `patilomkar7570/TimeDeck` repository. It commits the source, pushes the `main` branch and `v1.0.0` tag, then creates the GitHub release using `RELEASE_NOTES.md`. The project is MIT-licensed; confirm the existing repository history and remote before running the helper. This is the first stable release, `v1.0.0`.

One-time prerequisites: install [Git](https://git-scm.com/downloads), install [GitHub CLI](https://cli.github.com/), then authenticate with:

```powershell
gh auth login
```

After extracting the project, double-click `Publish-TimeDeck-GitHub.bat`. Or run `scripts/publish-github.ps1` from PowerShell. Review the target repository and visibility before confirming the GitHub CLI prompts. The Pages workflow then builds and deploys the site to `https://patilomkar7570.github.io/TimeDeck/`; wait for the **Deploy TimeDeck to GitHub Pages** workflow to complete before using the hosted launch files.

## Run manually

Requirements: Node.js 20.19+ (or a compatible newer LTS release) and npm.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. To run the checks and create a production build:

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. Publish that directory to any static HTTPS host; no server-side runtime is required. GitHub Pages deployment is configured in `.github/workflows/pages.yml`.

## Time and timezone correctness

The device's system clock supplies the current timestamp. A city's IANA timezone identifier—not a fixed offset—is the source for its local clock and offset. Temporal is used to distinguish daylight-saving overlaps (a local time occurs twice) from gaps (a local time does not exist). Time zone rules are supplied by the browser/runtime, and the searchable city metadata is bundled with the app. Keep the browser updated for current timezone database rules. An inaccurate operating-system clock can produce inaccurate results.

## Privacy and storage

Saved cities, groups and preferences are stored in the current browser profile's `localStorage` under the `timedeck:v2` key. Data is scoped to the browser origin/profile; the Brave web-tab and Brave app-window launchers share the same profile and local data. Export a JSON backup before clearing browser data or moving to another browser/device.

## Project structure

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── public/                 # PWA manifest and icons
├── scripts/                # Service-worker generator and Windows launcher
├── src/
│   ├── components/         # Four screens and reusable UI components
│   ├── lib/                # City catalogue, storage and timezone logic
│   ├── styles/
│   └── types/
├── tests/
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── package.json
```

## Contributing

Bug reports, accessibility feedback and focused improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please keep TimeDeck focused on World Clock, Compare Time, Time Converter and Settings.

## Security

Please see [SECURITY.md](SECURITY.md) for responsible disclosure guidance.

## License

TimeDeck is released under the MIT License. See [LICENSE](LICENSE).
