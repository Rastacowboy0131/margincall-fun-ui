import { AppLink } from '../../app/AppLink'
import { CHAIN } from '../../data/sample'
import { Wordmark } from '../brand/Wordmark'

const LEGAL = 'Not investment advice. Not affiliated with Robinhood Markets. This is a parody trading terminal where the only guarantee is the margin call.'

export function Footer({ variant = 'short' }: { variant?: 'full' | 'short' }) {
  if (variant === 'short') {
    return (
      <footer className="border-t border-line px-4 py-6">
        <p className="mx-auto max-w-[70ch] text-center text-xs text-ink-3">
          <AppLink to="/fair" className="font-medium text-ink-2 underline underline-offset-4 hover:text-ink">Verify fairness</AppLink>
          <span className="px-2">/</span>house edge {CHAIN.houseEdgePct}%, stated openly<span className="px-2">/</span>staging build, all data is mock
        </p>
        <p className="mx-auto mt-2 max-w-[70ch] text-center text-xs text-ink-3/70">{LEGAL}</p>
      </footer>
    )
  }
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Wordmark name="always" />
          <p className="mt-3 max-w-[44ch] text-sm text-ink-2">A leveraged position on a tokenised equity, launched every few seconds, on {CHAIN.networkName}. Eject before the call. Most people do not.</p>
          <p className="num mt-4 text-xs text-ink-3">edge {CHAIN.houseEdgePct}% / cap {CHAIN.maxPayoutX}x / median flight {CHAIN.medianRoundSecLow}-{CHAIN.medianRoundSecHigh}s</p>
        </div>
        <nav aria-label="The game">
          <h2 className="label">The game</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {[['/fair', 'Provably fair'], ['/board', 'Leaderboard'], ['/rewards', 'Rewards and referrals'], ['/me', 'Your flights']].map(([to, label]) => (
              <li key={to}><AppLink to={to} className="text-ink-2 transition-colors hover:text-ink">{label}</AppLink></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Elsewhere">
          <h2 className="label">Elsewhere</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {[[CHAIN.explorerName, CHAIN.explorerBaseUrl], ['Discord', 'https://example-margincall.invalid/discord'], ['X', 'https://example-margincall.invalid/x']].map(([label, href]) => (
              <li key={label}><a href={href} className="text-ink-2 transition-colors hover:text-ink" rel="noreferrer noopener" target="_blank">{label}</a></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line px-4 py-5 sm:px-6"><p className="mx-auto max-w-[80ch] text-center text-xs text-ink-3">{LEGAL}</p></div>
    </footer>
  )
}
