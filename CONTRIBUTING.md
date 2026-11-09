# Contributing to TimeDeck

Thanks for helping improve TimeDeck.

## Scope

Please keep changes focused on the four core areas: World Clock, Compare Time, Time Converter and Settings. Avoid adding unrelated product areas.

## Development setup

1. Install Node.js 20.19+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Before submitting changes, run:

   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

## Pull requests

- Explain the user problem and the behaviour changed.
- Include screenshots for visible UI changes where practical.
- Add or update tests for timezone, storage or city-management logic.
- Keep timezone calculations based on IANA identifiers; never introduce hardcoded city offsets.
- Avoid adding a cloud dependency, telemetry or unnecessary runtime services.
