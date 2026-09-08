# Margin Call, front end

```
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run preview  # serve dist/
```

## The interface

A trading terminal: near-black surfaces, hairlines, Anton for the wordmark,
page titles and the multiplier, Inter with tabular figures for everything
else. One accent, the lime, means long / profit / live. Red is the call.

Routes: `/` trade, `/portfolio`, `/history`, `/leaderboard`, `/rewards`,
`/referrals`, `/verify`. Old `/me`, `/board`, `/fair` redirect.

UX decisions on the trade screen, versus the earlier terminal concept:

- the multiplier sits in a readout band above the candles, not over them
- the order panel has an editable amount plus presets (0.001 / 0.005 /
  0.01 / 0.1 / MAX) and an explicit auto cash-out target; no asset picker,
  no Market/Limit tabs, no risk bar
- while you hold, the order panel becomes the position panel: size, entry,
  payout, unrealised P&L and one CASH OUT
- a persistent last-rounds strip under the header
- the margin call happens inside the chart card (jolt, red flood, stamp)
  and a toast reports it; nothing takes over the page
- toasts also report fills and cash-outs (`src/lib/toast.ts`)

`src/styles/tokens.css` holds the palette and type; `src/styles/base.css`
every keyframe. The engine, data contract and live-chain adapter under
`src/lib` and `src/data` are untouched by UI work. `mockups/` holds earlier
direction explorations.
