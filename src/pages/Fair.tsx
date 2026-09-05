import { useId, useState } from 'react'
import { AppLink } from '../app/AppLink'
import { CHAIN, FAIRNESS } from '../data/sample'
import { x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Icon } from '../components/ui/Icon'
import { Key, keyClasses } from '../components/ui/Key'
import { Panel } from '../components/ui/Panel'
import { Tag } from '../components/ui/Tag'

/* ------------------------------------------------------------------ *
 * Provably fair.
 *
 * Not a marketing page. Somebody arrives here because they have just
 * been liquidated at 1.02x and they think they were cheated, so the
 * page opens with the two hashes and gets out of the way. Explanation
 * comes after evidence, not before it.
 *
 * A 66-character hash is the longest unbroken string in the product and
 * the classic cause of horizontal scroll at 360px. Every one of them
 * below is in its own scroll container with `break-all` as a backstop.
 * ------------------------------------------------------------------ */

function Hash({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="eyebrow text-ink-3">{label}</span>
        <button
          type="button"
          onClick={() => setCopied(true)}
          className="-mr-2 flex min-h-[44px] items-center gap-1.5 rounded-tag px-2 text-[11px] font-bold text-ink-3 hover:text-gold"
        >
          <Icon name={copied ? 'check' : 'copy'} size={13} strokeWidth={2.4} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="nums overflow-x-auto rounded-key border border-rim bg-void px-3 py-2.5 text-xs break-all text-ink-2">
        {value}
      </p>
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
        first="PROVABLY"
        second="FAIR"
        lead={
          <>
            Every price path and every rug tick comes from a seed committed before the round
            opened. Here are the receipts, then the explanation.
          </>
        }
        aside={<Tag tone="gold">House edge {CHAIN.houseEdgePct}%</Tag>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Live round"
          count={<span className="nums text-xs font-bold text-gold">#{FAIRNESS.roundId}</span>}
        >
          <div className="flex flex-col gap-4">
            <Hash label="Server seed hash (committed)" value={FAIRNESS.serverSeedHash} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="eyebrow text-ink-3">Client seed</span>
                <p className="nums mt-1 text-sm break-all text-ink-2">{FAIRNESS.clientSeed}</p>
              </div>
              <div>
                <span className="eyebrow text-ink-3">Nonce</span>
                <p className="nums mt-1 text-sm text-ink-2">{FAIRNESS.nonce}</p>
              </div>
            </div>
            <p className="text-xs text-ink-3">
              The seed itself stays sealed until this round settles. That is the whole point of
              it.
            </p>
          </div>
        </Panel>

        <Panel
          title="Previous round"
          count={
            <span className="nums text-xs font-bold text-ink-3">#{FAIRNESS.previousRoundId}</span>
          }
        >
          <div className="flex flex-col gap-4">
            <Hash label="Server seed (revealed)" value={FAIRNESS.previousServerSeed} />
            <div className="flex items-center justify-between gap-3 rounded-key border border-down-deep/40 bg-down-wash px-3 py-2.5">
              <span className="text-sm text-ink-2">Rugged at</span>
              <span className="nums text-lg font-extrabold text-down">
                {x(FAIRNESS.previousRuggedAtX)}
              </span>
            </div>
            <p className="text-xs text-ink-3">
              Hash the seed above and it will equal the hash that was published before that round
              opened.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Check any round" className="mt-4">
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          Round number
        </label>
        <p className="mt-1 text-xs text-ink-3">
          Any settled round. The seed, the path and the rug tick all come back.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="4416"
            /* 16px minimum, or iOS zooms the viewport on focus — the
             * clearest possible sign that nobody tested on a phone. */
            className="min-h-[48px] min-w-0 flex-1 rounded-key border border-edge bg-void px-3.5 text-base text-ink placeholder:text-ink-3"
          />
          {/* Nora: this is the lookup seam. */}
          <Key variant="cash" size="md" className="shrink-0 sm:w-[150px]">
            Verify round
          </Key>
        </div>
      </Panel>

      <h2 className="mt-10 text-2xl font-extrabold tracking-tight">How the commitment works</h2>
      <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-panel border border-rim bg-panel p-4">
            <span
              aria-hidden="true"
              className="mb-3 grid size-8 place-items-center rounded-chip bg-gold font-sign text-xs text-void"
            >
              {i + 1}
            </span>
            <h3 className="text-base font-extrabold tracking-tight text-ink">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-panel border border-rim bg-panel/60 p-5">
        <h3 className="text-base font-extrabold tracking-tight text-ink">
          What the house keeps, said plainly
        </h3>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-2">
          <li>
            House edge is <span className="font-bold text-gold">{CHAIN.houseEdgePct}%</span>. It is
            in the distribution of rug ticks, not in a fee taken off your payout.
          </li>
            <li>
            Winnings are capped at{' '}
            <span className="nums font-bold text-gold">{CHAIN.maxPayoutX}x</span> per position,
            however far the round runs.
          </li>
          <li>
            The median round lasts {CHAIN.medianRoundSecLow}&ndash;{CHAIN.medianRoundSecHigh}{' '}
            seconds, with a fat tail. Most rounds are short. A few are absurd.
          </li>
          <li>Holding a position when the call lands loses the position, not a portion of it.</li>
        </ul>
        <AppLink to="/" className={`${keyClasses('quiet', 'md')} mt-5`}>
          Back to the table
        </AppLink>
      </div>
    </div>
  )
}
