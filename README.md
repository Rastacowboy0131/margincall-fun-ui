# Margin Call, front end

```
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run preview  # serve dist/
```

## The interface

The round is a LAUNCH. Deep space behind everything, a cockpit under the sky,
crew capsules docked down the side. Barlow Condensed for the altitude, headings and the big keys,
Barlow for the interface and, with tabular figures, every number.

- the sky is one canvas (`src/components/table/FlightPath.tsx`): a star field
  that streaks faster the higher the multiple climbs, the flight path with an
  exhaust trail, the rocket rotated along its tangent, particles peeling off
  the head, and a burst of 90 particles when the flight is lost
- the altitude turns gold from 2.5x and red under the open
- BOARD / EJECT is one hazard-striped button that swaps with a blur crossfade
- crew capsules dock in when someone boards, eject under a parachute when
  they sell, and burn red when they go down
- the flight log FLIP-slides when a round settles; the fuel readout flashes
- every gauge (stake, auto-eject, PAPER|LIVE, board tabs) shares one sliding
  indicator

Everything collapses to its settled state under `prefers-reduced-motion`.
`src/styles/tokens.css` holds the palette, type and motion tokens;
`src/styles/base.css` every keyframe. `mockups/` holds the three throwaway
HTML mockups the direction was chosen from. The engine, data contract and
live-chain adapter under `src/lib` and `src/data` are untouched.
