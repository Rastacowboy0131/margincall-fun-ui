import { AppLink } from '../../app/AppLink'
import { CHAIN } from '../../data/sample'
import { Wordmark } from '../brand/Wordmark'

const LEGAL = 'Not investment advice. Not affiliated with Robinhood Markets. This is a parody trading terminal where the only guarantee is the margin call.'

export function Footer() {
  const items = [
    'Staging build, all data is mock',
    `built for ${CHAIN.networkName}`,
    `house edge ${CHAIN.houseEdgePct}%, stated openly`,
  ]
  return (
    <footer className="border-t border-line px-4 py-8 text-center">
      <div className="flex justify-center"><Wordmark name="always" size="sm" /></div>
      <ul className="mx-auto mt-4 flex max-w-[90ch] flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-ink-3">
        {items.map((t) => <li key={t} className="whitespace-nowrap">{t}</li>)}
        <li className="whitespace-nowrap"><AppLink to="/#how" className="text-lime underline underline-offset-4 hover:text-ink">How it works</AppLink></li>
        <li className="whitespace-nowrap"><AppLink to="/verify" className="text-lime underline underline-offset-4 hover:text-ink">Verify fairness</AppLink></li>
      </ul>
      <p className="mx-auto mt-4 max-w-[80ch] text-2xs leading-relaxed text-ink-3/70">{LEGAL}</p>
    </footer>
  )
}
