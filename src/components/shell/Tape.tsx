import { TAPE } from '../../data/sample'
import { price, signedPct } from '../../lib/format'

/* ------------------------------------------------------------------ *
 * The market tape.
 *
 * The only place in the product where a figure is a PRICE rather than a
 * multiple, and the joke the whole thing rests on: real tickers crawling
 * over the top of a casino. It is decoration, so it is quiet — ink-3 for
 * the symbol, and colour only on the change.
 *
 * The row is duplicated once and the track translates by exactly -50%,
 * which is what makes the loop seamless. Both copies are aria-hidden and
 * the strip is presentational: a screen reader has no use for a marquee.
 * ------------------------------------------------------------------ */

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {TAPE.map((t) => (
        <span key={t.symbol} className="flex items-center gap-1.5 px-4 text-micro whitespace-nowrap">
          <span className="font-bold tracking-wide text-ink-2">{t.symbol}</span>
          <span className="nums text-ink-3">{price(t.price)}</span>
          <span className={t.changePct < 0 ? 'nums text-down' : 'nums text-up'}>
            {signedPct(t.changePct)}
          </span>
        </span>
      ))}
    </div>
  )
}

export function Tape() {
  return (
    <div
      aria-hidden="true"
      className="relative h-[26px] overflow-hidden border-b border-rim bg-void"
    >
      <div className="marquee-track flex h-full w-max items-center">
        <Row />
        <Row />
      </div>
      {/* Fade the strip into the page at both ends so it reads as a
       * continuous crawl rather than a clipped row. */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-void to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-void to-transparent" />
    </div>
  )
}
