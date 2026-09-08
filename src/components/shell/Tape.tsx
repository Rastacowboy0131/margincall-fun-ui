import { TAPE } from '../../data/sample'
import { price, signedPct } from '../../lib/format'

/* The market tape: the underlyings' real prices, crawling. Decoration. */

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {TAPE.map((t) => (
        <span key={t.symbol} className="num flex items-center gap-2 px-4 text-2xs whitespace-nowrap">
          <span className="font-bold text-ink-2">{t.symbol}</span>
          <span className="text-ink-3">{price(t.price)}</span>
          <span className={t.changePct < 0 ? 'font-semibold text-down' : 'font-semibold text-lime'}>{signedPct(t.changePct)}</span>
        </span>
      ))}
    </div>
  )
}

export function Tape() {
  return (
    <div aria-hidden="true" className="relative h-[26px] overflow-hidden border-b border-line bg-surface">
      <div className="marquee-track flex h-full w-max items-center"><Row /><Row /></div>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-surface to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent" />
    </div>
  )
}
