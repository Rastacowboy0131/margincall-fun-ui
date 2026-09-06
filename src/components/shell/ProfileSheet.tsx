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
import { Key } from '../ui/Key'
import { Sheet } from '../ui/Sheet'
import { Tag } from '../ui/Tag'

/* ------------------------------------------------------------------ *
 * The profile editor. Demo-mode identity: a display name, socials and
 * a pfp, stored in this browser and printed wherever the local player
 * appears — the seat rail, the live feed, the board, the Me page.
 * Same sheet language as Connect and the wallet.
 * ------------------------------------------------------------------ */

const YOU_TINT = '#ffc247'

const SOCIALS: { key: 'x' | 'telegram' | 'discord'; label: string; placeholder: string }[] = [
  { key: 'x', label: 'X', placeholder: 'handle' },
  { key: 'telegram', label: 'Telegram', placeholder: 'handle' },
  { key: 'discord', label: 'Discord', placeholder: 'username' },
]

const FIELD =
  'min-h-[44px] w-full rounded-key border border-rim bg-void px-3 text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-3 focus:border-gold focus:outline-none'

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

  const submit = () => {
    saveProfile(draft)
    onClose()
  }

  const clear = () => {
    saveProfile(EMPTY_PROFILE)
    setDraft(EMPTY_PROFILE)
    setPfpError('')
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      labelId="profile-sheet-title"
      title="Your profile"
      subtitle="Stored in this browser only. Shown at the table, in the feed and on the board."
    >
      {/* pfp + name row */}
      <div className="flex items-center gap-4">
        <Avatar
          handle={draft.name || 'you'}
          tint={YOU_TINT}
          size={64}
          ring="gold"
          pfp={draft.pfp || undefined}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="profile-name" className="eyebrow text-ink-3">
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
        <Key size="sm" variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? 'Resizing…' : 'Upload pfp'}
        </Key>
        {draft.pfp ? (
          <Key size="sm" variant="quiet" onClick={() => set('pfp', '')}>
            Remove
          </Key>
        ) : null}
        <Tag tone="gold">Demo</Tag>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {pfpError ? <p className="mt-1.5 text-xs font-bold text-down">{pfpError}</p> : null}

      <div className="mt-5 flex flex-col gap-2">
        <span className="eyebrow text-ink-3">Socials</span>
        {SOCIALS.map((f) => (
          <label key={f.key} className="flex items-center gap-2">
            <span className="eyebrow w-[76px] shrink-0 text-[10px] text-ink-3">{f.label}</span>
            <span className="flex min-h-[44px] min-w-0 flex-1 items-center rounded-key border border-rim bg-void focus-within:border-gold">
              <span className="pl-3 text-sm font-bold text-ink-3">@</span>
              <input
                type="text"
                value={draft[f.key]}
                maxLength={HANDLE_MAX}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, cleanHandle(e.target.value))}
                className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-3 focus:outline-none"
              />
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Key variant="cash" size="md" className="flex-1" onClick={submit}>
          Save profile
        </Key>
        <Key variant="quiet" size="md" onClick={clear}>
          Clear
        </Key>
      </div>
    </Sheet>
  )
}
