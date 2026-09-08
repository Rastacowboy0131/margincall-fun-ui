import { TAPE } from '../../data/sample'
import { price, signedPct } from '../../lib/format'

/* Ground control: the underlyings' real prices, crawling. Decoration. */

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {TAPE.map((t) => (
        <span key={t.symbol} className="num flex items-center gap-2 px-5 text-2xs whitespace-nowrap">
          <span className="text-ink-2">{t.symbol}</span>
          <span className="text-ink-3">{price(t.price)}</span>
          <span className={t.changePct < 0 ? 'text-down' : 'text-up'}>{signedPct(t.changePct)}</span>
        </span>
      ))}
    </div>
  )
}

export function Tape() {
  return (
    <div aria-hidden="true" className="relative h-6 overflow-hidden border-b border-line bg-bg">
      <div className="marquee-track flex h-full w-max items-center"><Row /><Row /></div>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bg to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg to-transparent" />
    </div>
  )
}
