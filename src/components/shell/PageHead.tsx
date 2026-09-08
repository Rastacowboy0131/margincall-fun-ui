import type { ReactNode } from 'react'

export function PageHead({ title, lead, aside }: { title: string; lead: ReactNode; aside?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-[56ch] text-[15px] text-ink-2">{lead}</p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  )
}
