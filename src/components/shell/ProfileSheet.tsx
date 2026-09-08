import { useRef, useState } from 'react'
import {
  EMPTY_PROFILE,
  NAME_MAX,
  HANDLE_MAX,
  cleanHandle,
  cleanName,
  fileToPfp,
  saveProfile,
  useProfile,
  type Profile,
} from '../../lib/profile'
import { Avatar } from '../brand/Avatar'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'

/* The profile editor. Stored in this browser and printed wherever the
 * local player appears. */

const YOU_TINT = '#ffcf5a'

const SOCIALS: { key: 'x' | 'telegram' | 'discord'; label: string; placeholder: string }[] = [
  { key: 'x', label: 'X', placeholder: 'handle' },
  { key: 'telegram', label: 'Telegram', placeholder: 'handle' },
  { key: 'discord', label: 'Discord', placeholder: 'username' },
]

const FIELD =
  'min-h-[42px] w-full rounded-ctl border border-line bg-bg px-3 text-sm font-medium text-ink placeholder:font-normal placeholder:text-ink-3 transition-colors focus:border-ink-2 focus:outline-none'

export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saved = useProfile()
  const [draft, setDraft] = useState<Profile>(saved)
  const [pfpError, setPfpError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  if (!open) return null

  const set = (k: keyof Profile, v: string) => setDraft((d) => ({ ...d, [k]: v }))

  const onFile = async (file: File | undefined) => {
    setPfpError('')
    if (!file) return
    setBusy(true)
    try {
      set('pfp', await fileToPfp(file))
    } catch (e) {
      setPfpError(e instanceof Error ? e.message : 'Could not process image.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      labelId="profile-sheet-title"
      title="Your profile"
      subtitle="Stored in this browser only. Shown at the table, in the feed and on the board."
    >
      <div className="flex items-center gap-4">
        <Avatar handle={draft.name || 'you'} tint={YOU_TINT} size={56} pfp={draft.pfp || undefined} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="profile-name" className="label">
            Display name
          </label>
          <input
            id="profile-name"
            type="text"
            value={draft.name}
            maxLength={NAME_MAX}
            placeholder="you"
            onChange={(e) => set('name', cleanName(e.target.value))}
            className={FIELD}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? 'Resizing…' : 'Upload picture'}
        </Button>
        {draft.pfp ? (
          <Button size="sm" variant="quiet" onClick={() => set('pfp', '')}>
            Remove
          </Button>
        ) : null}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      </div>
      {pfpError ? <p className="mt-1.5 text-xs font-medium text-down">{pfpError}</p> : null}

      <div className="mt-5 flex flex-col gap-2">
        <span className="label">Socials</span>
        {SOCIALS.map((f) => (
          <label key={f.key} className="flex items-center gap-2">
            <span className="label w-[72px] shrink-0">{f.label}</span>
            <span className="flex min-h-[42px] min-w-0 flex-1 items-center rounded-ctl border border-line bg-bg transition-colors focus-within:border-ink-2">
              <span className="pl-3 text-sm text-ink-3">@</span>
              <input
                type="text"
                value={draft[f.key]}
                maxLength={HANDLE_MAX}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, cleanHandle(e.target.value))}
                className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-sm font-medium text-ink placeholder:font-normal placeholder:text-ink-3 focus:outline-none"
              />
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button variant="go" size="md" className="flex-1" onClick={() => { saveProfile(draft); onClose() }}>
          Save profile
        </Button>
        <Button variant="quiet" size="md" onClick={() => { saveProfile(EMPTY_PROFILE); setDraft(EMPTY_PROFILE); setPfpError('') }}>
          Clear
        </Button>
      </div>
    </Sheet>
  )
}
