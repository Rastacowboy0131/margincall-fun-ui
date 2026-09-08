import { useState } from 'react'
import type { LeaderRow } from '../data/types'
import { BEST_EXITS, BIGGEST_WINS, HALL_OF_SHAME } from '../data/sample'
import { signedEth, x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Avatar } from '../components/brand/Avatar'
import { Segmented } from '../components/ui/Segmented'
import { Tag } from '../components/ui/Tag'
import { displayName, useProfile } from '../lib/profile'
import { cx } from '../lib/cx'

/* The board. The top three get room: the rank as a large light
 * numeral, the figure that earned it large beside it. Everyone from
 * fourth down is a row, because past third nobody is being celebrated,
 * they are being listed. */

const BOARDS = {
  wins: { label: 'Biggest wins', rows: BIGGEST_WINS, atLabel: 'exit', blurb: 'Single positions that paid. Sold, not held.' },
  exits: { label: 'Best exits', rows: BEST_EXITS, atLabel: 'sold at', blurb: 'Sold closest to the call and lived. The tightest nerve on the table.' },
  shame: { label: 'Hall of shame', rows: HALL_OF_SHAME, atLabel: 'called at', blurb: 'Liquidated nearest the open. Bought the top, kept the receipt.' },
} as const

type BoardKey = keyof typeof BOARDS

function Top({ row, place, atLabel, i }: { row: LeaderRow; place: number; atLabel: string; i: number }) {
  const profile = useProfile()
  const name = row.isYou ? displayName(profile) : row.handle
  return (
    <li
      className={cx(
        'anim-dock flex flex-col gap-4 p-5',
        place === 0 && 'bg-surface-2',
        row.isYou && 'outline outline-1 -outline-offset-1 outline-ink/30',
      )}
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className={cx('display text-6xl leading-none font-extrabold', place === 0 ? 'text-ink' : 'text-ink-3')}>
          {String(place + 1).padStart(2, '0')}
        </span>
        {row.tag && <Tag tone={place === 0 ? 'gold' : 'quiet'}>{row.tag}</Tag>}
      </div>
      <div className="flex items-center gap-2.5">
        <Avatar handle={name} tint={row.tint} size={28} pfp={row.isYou ? profile.pfp || undefined : undefined}  />
        <span className="truncate text-sm font-medium text-ink">{name}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="label">{atLabel}</div>
          <div className="display mt-1 text-4xl leading-none font-extrabold normal-case text-ink">{x(row.atX)}</div>
        </div>
        <div className="text-right">
          <div className="label">{row.ticker}</div>
          <div className={cx('num mt-1 text-lg leading-none font-semibold', row.valueEth < 0 ? 'text-down' : 'text-up')}>
            {signedEth(row.valueEth)}
          </div>
        </div>
      </div>
    </li>
  )
}

export function Board() {
  const [key, setKey] = useState<BoardKey>('wins')
  const profile = useProfile()
  const board = BOARDS[key]
  const top = board.rows.slice(0, 3)
  const rest = board.rows.slice(3)

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead
        title="The board"
        lead="The best, the luckiest and the most publicly humiliated. Updated while you were holding too long."
      />

      <Segmented
        ariaLabel="Which leaderboard"
        className="max-w-[480px]"
        value={key}
        onChange={setKey}
        items={(Object.keys(BOARDS) as BoardKey[]).map((k) => ({
          value: k,
          label: <span className="font-sans">{BOARDS[k].label}</span>,
        }))}
      />
      <p key={key} className="anim-fade mt-3 text-sm text-ink-2">
        {board.blurb}
      </p>

      <ul key={`top-${key}`} className="mt-6 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {top.map((row, i) => (
          <Top key={row.handle} row={row} place={i} atLabel={board.atLabel} i={i} />
        ))}
      </ul>

      <section className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
        <header className="flex min-h-[42px] items-center border-b border-line px-4">
          <h2 className="label">From fourth down</h2>
        </header>
        {rest.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-3">Only three people have managed this so far. There is room.</p>
        ) : (
          <ul key={`rest-${key}`} className="divide-y divide-line">
            {rest.map((row, i) => (
              <li
                key={row.handle}
                className={cx('anim-dock flex items-center gap-3 px-4 py-3', row.isYou && 'bg-surface-2')}
                style={{ animationDelay: `${180 + i * 40}ms` }}
              >
                <span className="num w-6 shrink-0 text-sm text-ink-3">{String(row.rank).padStart(2, '0')}</span>
                <Avatar
                  handle={row.isYou ? displayName(profile) : row.handle}
                  tint={row.tint}
                  size={24}
                  pfp={row.isYou ? profile.pfp || undefined : undefined}
                  
                />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className={cx('truncate text-sm font-medium', row.isYou ? 'text-ink' : 'text-ink-2')}>
                    {row.isYou ? displayName(profile) : row.handle}
                  </span>
                  {row.tag && <Tag tone="quiet">{row.tag}</Tag>}
                </span>
                <span className="hidden w-20 shrink-0 text-right text-xs text-ink-3 sm:block">{row.ticker}</span>
                <span className="num w-16 shrink-0 text-right text-sm text-ink-2 sm:w-20">{x(row.atX)}</span>
                <span className={cx('num w-[72px] shrink-0 text-right text-sm font-semibold sm:w-24', row.valueEth < 0 ? 'text-down' : 'text-up')}>
                  {signedEth(row.valueEth)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
