import type { ReactNode } from 'react'

/* Two words, the second in lime, in the display face. */

export function PageHead({ first, second, lead, aside }: { first: string; second: string; lead: ReactNode; aside?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="display text-4xl leading-none tracking-wide sm:text-5xl"><span className="text-ink">{first} </span><span className="text-lime">{second}</span></h1>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-2">{lead}</p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  )
}
