import { AppLink } from '../../app/AppLink'
import { CHAIN } from '../../data/sample'
import { Icon } from '../ui/Icon'
import { Wordmark } from '../brand/Wordmark'

/* ------------------------------------------------------------------ *
 * Chrome is sized per route, so this is one component with two shapes.
 *
 *   full  — only on the table, which is the page people arrive on.
 *   short — every other route. Repeating "Play · Me · Board · Rewards"
 *           at the bottom of a page you are already inside of is noise,
 *           and on a phone it pushes the real content further from the
 *           fold for nothing. The short one carries only what is NOT
 *           already reachable from the header: fairness, and the legal
 *           line this product genuinely needs.
 * ------------------------------------------------------------------ */

const LEGAL =
  'Not investment advice. Not affiliated with Robinhood Markets. This is a parody trading terminal where the only guarantee is the margin call.'

export function Footer({ variant = 'short' }: { variant?: 'full' | 'short' }) {
  if (variant === 'short') {
    return (
      <footer className="border-t border-rim px-4 py-6 text-center">
        <p className="mx-auto max-w-[62ch] text-xs text-ink-3">
          <AppLink to="/fair" className="font-bold text-gold underline underline-offset-2">
            Verify fairness
          </AppLink>
          <span className="px-2 text-rim-hi">·</span>
          house edge {CHAIN.houseEdgePct}%, stated openly
          <span className="px-2 text-rim-hi">·</span>
          staging build, all data is mock
        </p>
        <p className="mx-auto mt-2 max-w-[62ch] text-xs text-ink-3/80">{LEGAL}</p>
      </footer>
    )
  }

  return (
    <footer className="border-t border-rim bg-panel/50">
      <div className="mx-auto grid max-w-[1560px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark name="always" />
          <p className="mt-3 max-w-[42ch] text-sm text-ink-2">
            A leveraged position on a tokenised equity, opened every few seconds, on{' '}
            {CHAIN.networkName}. Sell before the call. Most people do not.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
            <span>House edge {CHAIN.houseEdgePct}%</span>
            <span className="text-rim-hi">·</span>
            <span>Winnings capped at {CHAIN.maxPayoutX}x</span>
            <span className="text-rim-hi">·</span>
            <span>
              Median round {CHAIN.medianRoundSecLow}&ndash;{CHAIN.medianRoundSecHigh}s
            </span>
          </p>
        </div>

        <nav aria-label="The game">
          <h2 className="eyebrow text-ink-3">The game</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <AppLink to="/fair" className="text-ink-2 hover:text-gold">
                Provably fair
              </AppLink>
            </li>
            <li>
              <AppLink to="/board" className="text-ink-2 hover:text-gold">
                Leaderboard
              </AppLink>
            </li>
            <li>
              <AppLink to="/rewards" className="text-ink-2 hover:text-gold">
                Rewards &amp; referrals
              </AppLink>
            </li>
            <li>
              <AppLink to="/me" className="text-ink-2 hover:text-gold">
                Your positions
              </AppLink>
            </li>
          </ul>
        </nav>

        <nav aria-label="Elsewhere">
          <h2 className="eyebrow text-ink-3">Elsewhere</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {[
              [CHAIN.explorerName, CHAIN.explorerBaseUrl],
              ['Discord', 'https://example-margincall.invalid/discord'],
              ['X', 'https://example-margincall.invalid/x'],
            ].map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="inline-flex items-center gap-1.5 text-ink-2 hover:text-gold"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {label}
                  <Icon name="external" size={13} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-rim px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-[80ch] text-center text-xs text-ink-3">{LEGAL}</p>
      </div>
    </footer>
  )
}
