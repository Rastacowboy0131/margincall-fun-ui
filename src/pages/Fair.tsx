import { useId, useState } from 'react'
import { AppLink } from '../app/AppLink'
import { CHAIN, FAIRNESS } from '../data/sample'
import { x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Icon } from '../components/ui/Icon'
import { Button, buttonClasses } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Tag } from '../components/ui/Tag'

/* Provably fair. Somebody arrives here because they were just
 * liquidated at 1.02x and think they were cheated, so the page opens
 * with the two hashes and gets out of the way. */

function Hash({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="label">{label}</span>
        <button
          type="button"
          onClick={() => setCopied(true)}
          className="-mr-2 flex min-h-[32px] items-center gap-1.5 rounded-ctl px-2 text-2xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <Icon name={copied ? 'check' : 'copy'} size={12} strokeWidth={2.4} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="num overflow-x-auto rounded-ctl border border-line bg-bg px-3 py-2.5 text-xs break-all text-ink-2">{value}</p>
    </div>
  )
}

const STEPS = [
  {
    title: 'Before the round',
    body: 'The house generates a server seed, hashes it, and publishes the hash. That hash is on this page before a single position opens, so it cannot be changed afterwards.',
  },
  {
    title: 'During the round',
    body: 'The price path and the rug tick are both derived from that seed combined with the client seed and the nonce. Nothing is decided while you are watching.',
  },
  {
    title: 'After it settles',
    body: 'The server seed itself is revealed. Hash it yourself; if it matches the hash published beforehand, the round you just lost was already written when it opened.',
  },
]

export function Fair() {
  const inputId = useId()

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead
        title="Provably fair"
        lead="Every price path and every rug tick comes from a seed committed before the round opened. Here are the receipts, then the explanation."
        aside={<Tag tone="quiet">House edge {CHAIN.houseEdgePct}%</Tag>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Live round" count={<span className="num text-xs text-ink-2">#{FAIRNESS.roundId}</span>}>
          <div className="flex flex-col gap-4">
            <Hash label="Server seed hash (committed)" value={FAIRNESS.serverSeedHash} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="label">Client seed</span>
                <p className="num mt-1 text-sm break-all text-ink-2">{FAIRNESS.clientSeed}</p>
              </div>
              <div>
                <span className="label">Nonce</span>
                <p className="num mt-1 text-sm text-ink-2">{FAIRNESS.nonce}</p>
              </div>
            </div>
            <p className="text-xs text-ink-3">The seed itself stays sealed until this round settles. That is the whole point of it.</p>
          </div>
        </Panel>

        <Panel title="Previous round" count={<span className="num text-xs text-ink-3">#{FAIRNESS.previousRoundId}</span>}>
          <div className="flex flex-col gap-4">
            <Hash label="Server seed (revealed)" value={FAIRNESS.previousServerSeed} />
            <div className="flex items-center justify-between gap-3 rounded-ctl border border-down/40 bg-down-wash px-3 py-2.5">
              <span className="text-sm text-ink-2">Rugged at</span>
              <span className="num text-lg font-semibold text-down">{x(FAIRNESS.previousRuggedAtX)}</span>
            </div>
            <p className="text-xs text-ink-3">Hash the seed above and it will equal the hash that was published before that round opened.</p>
          </div>
        </Panel>
      </div>

      <Panel title="Check any round" className="mt-4">
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          Round number
        </label>
        <p className="mt-1 text-xs text-ink-3">Any settled round. The seed, the path and the rug tick all come back.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4416"
            className="num min-h-[44px] min-w-0 flex-1 rounded-ctl border border-line bg-bg px-3.5 text-base text-ink transition-colors placeholder:text-ink-3 focus:border-ink-2 focus:outline-none"
          />
          <Button variant="go" size="md" className="shrink-0 sm:w-[150px]">
            Verify round
          </Button>
        </div>
      </Panel>

      <h2 className="display mt-12 text-3xl font-bold tracking-wide">How the commitment works</h2>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[48px_1fr] gap-4 py-5">
            <span aria-hidden="true" className="num pt-0.5 text-2xl font-light text-ink-3">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <h3 className="text-base font-semibold tracking-tight text-ink">What the house keeps, said plainly</h3>
        <ul className="mt-3 flex max-w-[62ch] flex-col gap-2 text-sm text-ink-2">
          <li>
            House edge is <span className="num font-medium text-ink">{CHAIN.houseEdgePct}%</span>. It is in the distribution
            of rug ticks, not in a fee taken off your payout.
          </li>
          <li>
            Winnings are capped at <span className="num font-medium text-ink">{CHAIN.maxPayoutX}x</span> per position,
            however far the round runs.
          </li>
          <li>
            The median round lasts {CHAIN.medianRoundSecLow}-{CHAIN.medianRoundSecHigh} seconds, with a fat tail. Most
            rounds are short. A few are absurd.
          </li>
          <li>Holding a position when the call lands loses the position, not a portion of it.</li>
        </ul>
        <AppLink to="/" className={`${buttonClasses('ghost', 'md')} mt-5`}>
          Back to the launch
        </AppLink>
      </div>
    </div>
  )
}
