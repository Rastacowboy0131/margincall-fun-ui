import { useState } from 'react'
import type { LeaderRow } from '../data/types'
import { BEST_EXITS, BIGGEST_WINS, HALL_OF_SHAME } from '../data/sample'
import { signedEth, x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Avatar } from '../components/brand/Avatar'
import { Panel } from '../components/ui/Panel'
import { Tag } from '../components/ui/Tag'
import { cx } from '../lib/cx'

/* ------------------------------------------------------------------ *
 * The board.
 *
 * The top three are drawn as an actual podium rather than as the first
 * three rows of a table — different heights, different metals, the
 * winner physically raised. It is the one element on this page that
 * depicts instead of tabulating, and it is what stops a leaderboard
 * from being a spreadsheet with a trophy emoji on it.
 *
 * Everyone from fourth down is a row, because past third nobody is
 * being celebrated, they are being listed.
 * ------------------------------------------------------------------ */

const BOARDS = {
  wins: {
    label: 'Biggest wins',
    rows: BIGGEST_WINS,
    valueLabel: 'Profit',
    atLabel: 'Exit',
    blurb: 'Single positions that paid. Sold, not held.',
  },
  exits: {
    label: 'Best exits',
    rows: BEST_EXITS,
    valueLabel: 'Rugged at',
    atLabel: 'Sold at',
    blurb: 'Sold closest to the call and lived. The tightest nerve on the table.',
  },
  shame: {
    label: 'Hall of shame',
    rows: HALL_OF_SHAME,
    valueLabel: 'Lost',
    atLabel: 'Called at',
    blurb: 'Liquidated nearest the open. Bought the top, kept the receipt.',
  },
} as const

type BoardKey = keyof typeof BOARDS

const METAL = [
  { ring: 'border-gold', bg: 'bg-gold-wash', text: 'text-gold', height: 'h-[124px]', label: '1ST' },
  { ring: 'border-edge', bg: 'bg-panel-2', text: 'text-ink', height: 'h-[98px]', label: '2ND' },
  { ring: 'border-gold-dark', bg: 'bg-panel', text: 'text-ink-2', height: 'h-[78px]', label: '3RD' },
]

function Step({ row, place, atLabel }: { row: LeaderRow; place: number; atLabel: string }) {
  const m = METAL[place]
  // Visual order on the podium is 2nd, 1st, 3rd; source order stays 1,2,3.
  const order = place === 0 ? 'order-2' : place === 1 ? 'order-1' : 'order-3'
  return (
    <li className={cx('flex flex-1 flex-col items-center justify-end', order)}>
      {/* The block above the plinth is a fixed height so the three
       * players line up with each other and only the PLINTHS differ —
       * otherwise a GOAT tag on first place shunts its whole column
       * out of step with the other two. */}
      <div className="mb-2 flex h-[104px] w-full flex-col items-center justify-end gap-1.5">
        <Avatar
          handle={row.handle}
          tint={row.tint}
          size={place === 0 ? 50 : 40}
          ring={place === 0 ? 'gold' : undefined}
        />
        <span className="w-full truncate px-1 text-center text-xs font-bold text-ink">
          {row.isYou ? 'you' : row.handle}
        </span>
        {row.tag && <Tag tone="gold">{row.tag}</Tag>}
      </div>

      <div
        className={cx(
          'flex w-full flex-col items-center justify-start gap-0.5 rounded-t-key border-2 border-b-0 pt-2',
          m.ring,
          m.bg,
          m.height,
        )}
      >
        <span className={cx('font-sign text-[11px] tracking-tight', m.text)}>{m.label}</span>
        {/* Label the multiple properly. An earlier pass printed "EXIT"
         * over the ETH figure, which is the profit, not the exit. */}
        <span className="eyebrow text-[9px] text-ink-3">{atLabel}</span>
        <span className={cx('nums text-lg leading-none font-extrabold', m.text)}>{x(row.atX)}</span>
        <span
          className={cx(
            'nums mt-0.5 text-xs font-bold',
            row.valueEth < 0 ? 'text-down' : 'text-up',
          )}
        >
          {signedEth(row.valueEth)} ETH
        </span>
      </div>
    </li>
  )
}

export function Board() {
  const [key, setKey] = useState<BoardKey>('wins')
  const board = BOARDS[key]
  const top = board.rows.slice(0, 3)
  const rest = board.rows.slice(3)

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead
        first="THE"
        second="BOARD"
        lead="The best, the luckiest and the most publicly humiliated. Updated while you were holding too long."
      />

      <div role="group" aria-label="Which leaderboard" className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(BOARDS) as BoardKey[]).map((k) => {
          const on = k === key
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setKey(k)}
              className={cx(
                'key-3d flex min-h-[46px] items-center rounded-key px-4 text-sm font-extrabold [--key-depth:3px]',
                on
                  ? 'bg-gold text-void [--key-under:var(--color-gold-dark)]'
                  : 'border border-edge bg-panel-2 text-ink-2 [--key-under:var(--color-void)]',
              )}
            >
              {BOARDS[k].label}
            </button>
          )
        })}
      </div>

      <p className="mb-5 text-sm text-ink-2">{board.blurb}</p>

      {/* ---- the podium ---- */}
      <div className="overflow-hidden rounded-panel border border-rim bg-panel shadow-lift">
        <ul className="flex items-end gap-2 px-3 pt-6 sm:gap-4 sm:px-8">
          {top.map((row, i) => (
            <Step key={row.handle} row={row} place={i} atLabel={board.atLabel} />
          ))}
        </ul>
        <div aria-hidden="true" className="h-2 w-full bg-gold-dark" />
      </div>

      {/* ---- everyone else ---- */}
      <Panel
        title={`${board.label} — 4th down`}
        className="mt-4"
        bodyClassName="p-0"
      >
        {rest.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-3">
            Only three people have managed this so far. There is room.
          </p>
        ) : (
          <ul className="divide-y divide-rim">
            {rest.map((row) => (
              <li
                key={row.handle}
                className={cx(
                  'flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-4',
                  row.isYou && 'bg-gold-wash',
                )}
              >
                <span className="nums w-5 shrink-0 text-sm font-bold text-ink-3">{row.rank}</span>
                <Avatar handle={row.handle} tint={row.tint} size={28} />
                {/* Handles are real and long. The numeric columns are
                 * kept narrow so the name gets the remaining width
                 * rather than being cut to four characters. */}
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={cx(
                      'truncate text-sm font-bold',
                      row.isYou ? 'text-gold' : 'text-ink',
                    )}
                  >
                    {row.isYou ? 'you' : row.handle}
                  </span>
                  {row.tag && <Tag tone="gold">{row.tag}</Tag>}
                </span>
                <span className="hidden w-20 shrink-0 text-right text-xs text-ink-3 sm:block">
                  {row.ticker}
                </span>
                <span className="nums w-16 shrink-0 text-right text-sm font-bold text-ink-2 sm:w-20">
                  {x(row.atX)}
                </span>
                <span
                  className={cx(
                    'nums w-[72px] shrink-0 text-right text-sm font-extrabold sm:w-24',
                    row.valueEth < 0 ? 'text-down' : 'text-up',
                  )}
                >
                  {signedEth(row.valueEth)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
