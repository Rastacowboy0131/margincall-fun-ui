import type { ReactNode } from 'react'

/* The masthead every route except the table shares.
 *
 * Two words, one in ink and one in gold, at poster scale in the signage
 * face — the same device as the wordmark, so an inner page still reads
 * as part of the same sign. `lead` is the one place on these pages where
 * prose is allowed to run, and it is capped at a readable measure. */

export function PageHead({
  first,
  second,
  lead,
  aside,
}: {
  first: string
  second: string
  lead: ReactNode
  /** A control or figure sitting opposite the title on wide screens. */
  aside?: ReactNode
}) {
  return (
    <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="font-sign text-poster tracking-tight">
          <span className="text-ink">{first} </span>
          <span className="text-gold">{second}</span>
        </h1>
        <p className="mt-3 max-w-[58ch] text-base text-ink-2">{lead}</p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  )
}
