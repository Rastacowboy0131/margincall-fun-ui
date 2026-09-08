import { useState } from 'react'
import { BEST_EXITS, BIGGEST_WINS, HALL_OF_SHAME } from '../data/sample'
import { signedEth, x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Avatar } from '../components/brand/Avatar'
import { Panel } from '../components/ui/Panel'
import { Segmented } from '../components/ui/Segmented'
import { Tag } from '../components/ui/Tag'
import { displayName, useProfile } from '../lib/profile'
import { cx } from '../lib/cx'

const BOARDS = {
  wins: { label: 'Biggest wins', rows: BIGGEST_WINS, atLabel: 'Exit', valueLabel: 'Profit', blurb: 'Single positions that paid. Sold, not held.' },
  exits: { label: 'Best exits', rows: BEST_EXITS, atLabel: 'Sold at', valueLabel: 'Rugged at', blurb: 'Sold closest to the call and lived. The tightest nerve on the table.' },
  shame: { label: 'Hall of shame', rows: HALL_OF_SHAME, atLabel: 'Called at', valueLabel: 'Lost', blurb: 'Liquidated nearest the open. Bought the top, kept the receipt.' },
} as const
type BoardKey = keyof typeof BOARDS

export function Leaderboard() {
  const [key, setKey] = useState<BoardKey>('wins')
  const profile = useProfile()
  const board = BOARDS[key]
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead first="The" second="leaderboard" lead="The best, the luckiest and the most publicly humiliated. All-time records, updated while you were holding too long." />
      <Segmented ariaLabel="Which leaderboard" className="max-w-[480px]" value={key} onChange={setKey} items={(Object.keys(BOARDS) as BoardKey[]).map((k) => ({ value: k, label: <span className="font-sans">{BOARDS[k].label}</span> }))} />
      <p key={key} className="anim-fade mt-3 text-sm text-ink-2">{board.blurb}</p>

      <Panel title={board.label} icon="leaderboard" className="mt-5" bodyClassName="p-0">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-line">{['#', 'Degenerate', 'Token', board.atLabel, board.valueLabel].map((h, i) => <th key={h} scope="col" className={cx('label px-4 py-2.5', i >= 3 ? 'text-right' : 'text-left', i === 2 && 'hidden sm:table-cell')}>{h}</th>)}</tr></thead>
          <tbody key={key} className="divide-y divide-line">
            {board.rows.map((row, i) => {
              const name = row.isYou ? displayName(profile) : row.handle
              return (
                <tr key={row.handle} className={cx('anim-rise transition-colors hover:bg-surface-2', row.isYou && 'bg-lime-wash/60', i === 0 && 'bg-surface-2')} style={{ animationDelay: `${i * 35}ms` }}>
                  <td className={cx('num w-12 px-4 py-3 font-bold', i === 0 ? 'text-lime' : 'text-ink-3')}>{row.rank}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-2.5"><Avatar handle={name} tint={row.tint} size={26} ring={i === 0 ? 'lime' : undefined} pfp={row.isYou ? profile.pfp || undefined : undefined} /><span className={cx('truncate font-bold', row.isYou ? 'text-lime' : 'text-ink')}>{name}</span>{row.tag && <Tag tone="lime">{row.tag}</Tag>}</span></td>
                  <td className="hidden px-4 py-3 text-ink-3 sm:table-cell">{row.ticker}</td>
                  <td className="num px-4 py-3 text-right whitespace-nowrap font-bold text-ink">{x(row.atX)}</td>
                  <td className={cx('num px-4 py-3 text-right font-bold whitespace-nowrap', row.valueEth < 0 ? 'text-down' : 'text-lime')}>{signedEth(row.valueEth)} ETH</td>
                </tr>
              )
            })}
          </tbody>
        </table></div>
      </Panel>
    </div>
  )
}
